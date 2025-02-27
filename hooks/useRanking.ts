'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RankingUser } from '../types';

export function useRanking() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, name, referral_count')
          .order('referral_count', { ascending: false });

        if (error) throw error;

        const rankingWithPosition = data.map((user, index) => ({
          ...user,
          position: index + 1,
        }));

        setRanking(rankingWithPosition);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  return { ranking, loading, error };
}
