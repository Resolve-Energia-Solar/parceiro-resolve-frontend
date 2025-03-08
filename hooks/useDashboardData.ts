import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Referral {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DashboardData {
  recentReferrals: Referral[];
  referralCode: string;
  referrals: number;
  pending: number;
  approved: number;
  rejected: number;
  referenceLink: string;
}

interface ReferralData {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
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
    pending: 0,
    approved: 0,
    rejected: 0,
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

        const pendingCount = typedReferralsData.filter(referral => referral.status === 'pending').length;
        const approvedCount = typedReferralsData.filter(referral => referral.status === 'approved').length;
        const rejectedCount = typedReferralsData.filter(referral => referral.status === 'rejected').length;

        setData({
          recentReferrals: typedReferralsData.map(referral => ({
            id: referral.id,
            status: referral.status,
            date: referral.created_at,
            name: referral.referred_user.name
          })),
          referralCode: userData.referral_code,
          referrals: userData.referral_count,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
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
