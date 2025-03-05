import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 

interface DashboardData {
  referrals: number;
  rewards: number;
  users: number;
  disqualified: number;
  signedContracts: number;
  referenceLink: string;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    referrals: 0,
    rewards: 0,
    users: 0,
    disqualified: 0,
    signedContracts: 0,
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
        const referenceLink = userData?.referral_code 
          ? `${baseUrl}/referral/${userData.referral_code}`
          : "";

        const [rewardsData, usersLogDisqualified, usersLogSigned] = await Promise.all([
          supabase
            .from('rewards')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('users_log')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('action', 'disqualified'),
          supabase
            .from('users_log')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('action', 'signed_contract')
        ]);

        const referralsCount = userData?.referral_count || 0;

        setData({
          referrals: referralsCount,
          rewards: rewardsData.count || 0,
          users: 1,
          disqualified: usersLogDisqualified.count || 0,
          signedContracts: usersLogSigned.count || 0,
          referenceLink,
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};
