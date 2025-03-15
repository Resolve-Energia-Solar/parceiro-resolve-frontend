import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface Referral {
  id: string;
  name: string;
  date: string;
  status: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem Interesse ou Reprovado' | 'Aprovado';
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
  status: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem Interesse ou Reprovado' | 'Aprovado';
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
  const [error, setError] = useState<null | Error>(null);

  const fetchData = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        setLoading(true);
        setError(null);
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro na sessão:", sessionError);
          throw new Error("Erro ao verificar sessão");
        }
        
        if (!sessionData.session) {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            throw new Error("Sessão expirada e não foi possível renová-la");
          }
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Usuário não encontrado");
        }
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('referral_count, referral_code')
          .eq('id', user.id)
          .single();
        
        if (userError) {
          console.error("Erro ao buscar dados do usuário:", userError);
          throw userError;
        }
        
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
        
        if (referralsError) {
          console.error("Erro ao buscar referências:", referralsError);
          throw referralsError;
        }
        
        const typedReferralsData = referralsData as unknown as ReferralData[];
        
        const indicacaoCount = typedReferralsData.filter(referral => referral.status === 'Indicação').length;
        const contatoComercialCount = typedReferralsData.filter(referral => referral.status === 'Contato comercial').length;
        const emNegociacaoCount = typedReferralsData.filter(referral => referral.status === 'Em negociação').length;
        const semInteresseCount = typedReferralsData.filter(referral => referral.status === 'Sem Interesse ou Reprovado').length;
        const aprovadosCount = typedReferralsData.filter(referral => referral.status === 'Aprovado').length;
        
        setData({
          recentReferrals: typedReferralsData.map(referral => ({
            id: referral.id,
            status: referral.status,
            date: referral.created_at,
            name: referral.referred_user?.name || "Nome não disponível"
          })),
          referralCode: userData.referral_code,
          referrals: userData.referral_count || 0,
          indicacao: indicacaoCount,
          contatoComercial: contatoComercialCount,
          emNegociacao: emNegociacaoCount,
          semInteresse: semInteresseCount,
          aprovados: aprovadosCount,
          referenceLink,
        });
        
        setLoading(false);
        return true; 
      } catch (err) {
        attempts++;
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        console.error(`Tentativa ${attempts} falhou:`, errorMessage);
        
        if (attempts === maxAttempts) {
          console.error("Todas as tentativas de buscar dados falharam");
          setError(err instanceof Error ? err : new Error("Falha ao carregar dados"));
          setLoading(false);
          return false;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return false; 
  }, []);
  
  const updateWithNewReferral = useCallback((newReferral: Referral) => {
    setData(prevData => {
      const updatedReferrals = [newReferral, ...prevData.recentReferrals];
      
      return {
        ...prevData,
        recentReferrals: updatedReferrals,
        referrals: prevData.referrals + 1,
        indicacao: newReferral.status === 'Indicação' 
          ? prevData.indicacao + 1 
          : prevData.indicacao,
        contatoComercial: newReferral.status === 'Contato comercial' 
          ? prevData.contatoComercial + 1 
          : prevData.contatoComercial,
        emNegociacao: newReferral.status === 'Em negociação' 
          ? prevData.emNegociacao + 1 
          : prevData.emNegociacao,
        semInteresse: newReferral.status === 'Sem Interesse ou Reprovado' 
          ? prevData.semInteresse + 1 
          : prevData.semInteresse,
        aprovados: newReferral.status === 'Aprovado' 
          ? prevData.aprovados + 1 
          : prevData.aprovados,
      };
    });
    
    return true;
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    loading,
    error,
    refetch: fetchData,
    updateWithNewReferral
  };
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
