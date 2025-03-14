import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RankingUser {
  id: string;
  name: string;
  referral_count: number;
  approved_referrals: number;
  user_type: string;
  is_resolve_customer: boolean;

}

export function useRanking() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, referral_count, approved_referrals, user_type, is_resolve_customer')
          .in('user_type', ['Parceiro', 'Admin', 'SDR', 'Super admin'])
          .order('approved_referrals', { ascending: false });

        if (error) throw error;

        setRanking(data || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  return { ranking, loading, error };
}
