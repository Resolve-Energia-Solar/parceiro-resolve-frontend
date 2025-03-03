import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 

export const useDashboardData = () => {
  const [data, setData] = useState({
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
          .select('*')  
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        const baseUrl = window.location.origin;
        const referenceLink = userData?.referral_code 
          ? `${baseUrl}/referral/${userData.referral_code}`
          : "";

        console.log("userData:", userData); 
        console.log("referral_code:", userData?.referral_code); 
        console.log("referenceLink:", referenceLink); 

        const [referralsData, rewardsData, usersLogDisqualified, usersLogSigned] = await Promise.all([
          supabase.from('referrals').select('*', { count: 'exact' }).eq('referrer_id', user.id),
          supabase.from('rewards').select('*', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('users_log').select('*', { count: 'exact' }).eq('user_id', user.id).eq('action', 'disqualified'),
          supabase.from('users_log').select('*', { count: 'exact' }).eq('user_id', user.id).eq('action', 'signed_contract')
        ]);

        setData({
          referrals: referralsData.count || 0,
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
