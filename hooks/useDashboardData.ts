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
      setLoading(true);

      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*');
      const referralsCount = referralsData ? referralsData.length : 0;

      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*');
      const rewardsCount = rewardsData ? rewardsData.length : 0;

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      const usersCount = usersData ? usersData.length : 0;

      const { data: usersLogData, error: usersLogError } = await supabase
        .from('users_log')
        .select('*')
        .eq('action', 'disqualified');
      const disqualifiedCount = usersLogData ? usersLogData.length : 0;

      const { data: signedContractsData, error: signedContractsError } = await supabase
        .from('users_log')
        .select('*')
        .eq('action', 'signed_contract');
      const signedContractsCount = signedContractsData ? signedContractsData.length : 0;

      const referenceLink = usersData && usersData.length > 0 ? `https://www.resolve.com/referral/${usersData[0].id}` : "";

      setData({
        referrals: referralsCount,
        rewards: rewardsCount,
        users: usersCount,
        disqualified: disqualifiedCount,
        signedContracts: signedContractsCount,
        referenceLink, 
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  return { data, loading };
};
