import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Referral {
  id: string;
  name: string;
  date: string;
  status: 'Indicação' | 'Contato comercial' | 'Em negociacao' | 'Sem Interesse ou Reprovado' | 'Aprovado';
}

interface DashboardData {
  recentReferrals: Referral[];
  referralCode: string;
  referrals: number;
  indicacao: number;
  contatoComercial: number;
  emNegociacao: number;
  semInteresse: number;
  aprovados: number;
  referenceLink: string;
}

interface ReferralData {
  id: string;
  status: 'Indicação' | 'Contato comercial' | 'Em negociacao' | 'Sem Interesse ou Reprovado' | 'Aprovado';
  created_at: string;
  referred_user: {
    name: string;
  };
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    recentReferrals: [],
    referralCode: "",
    referrals: 0,
    indicacao: 0,
    contatoComercial: 0,
    emNegociacao: 0,
    semInteresse: 0,
    aprovados: 0,
    referenceLink: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('referral_count, referral_code')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const referenceLink = `${baseUrl}/referral/${userData.referral_code}`;

        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select(`
            id, 
            status, 
            created_at, 
            referred_user:users!referred_user_id (name)
          `)
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false });

        if (referralsError) throw referralsError;

        const typedReferralsData = referralsData as unknown as ReferralData[];

        const indicacaoCount = typedReferralsData.filter(referral => referral.status === 'Indicação').length;
        const contatoComercialCount = typedReferralsData.filter(referral => referral.status === 'Contato comercial').length;
        const emNegociacaoCount = typedReferralsData.filter(referral => referral.status === 'Em negociacao').length;
        const semInteresseCount = typedReferralsData.filter(referral => referral.status === 'Sem Interesse ou Reprovado').length;
        const aprovadosCount = typedReferralsData.filter(referral => referral.status === 'Aprovado').length;

        setData({
          recentReferrals: typedReferralsData.map(referral => ({
            id: referral.id,
            status: referral.status,
            date: referral.created_at,
            name: referral.referred_user.name
          })),
          referralCode: userData.referral_code,
          referrals: userData.referral_count,
          indicacao: indicacaoCount,
          contatoComercial: contatoComercialCount,
          emNegociacao: emNegociacaoCount,
          semInteresse: semInteresseCount,
          aprovados: aprovadosCount,
          referenceLink,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};

export const formatStatus = (status: string) => {
  const statusMap = {
    indicacao: 'Indicação',
    contato_comercial: 'Contato Comercial',
    em_negociacao: 'Em Negociação',
    sem_interesse: 'Sem Interesse ou Reprovado',
    aprovados: 'Aprovado'
  };

  return statusMap[status as keyof typeof statusMap] || status;
};

export const getStatusColor = (status: string) => {
  const colorMap = {
    indicacao: 'bg-blue-500',
    contato_comercial: 'bg-yellow-500',
    em_negociacao: 'bg-purple-500',
    sem_interesse: 'bg-red-500',
    aprovados: 'bg-green-500'
  };

  return colorMap[status as keyof typeof colorMap] || 'bg-gray-500';
};
