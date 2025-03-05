'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export function useUser() {
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (authUser) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (error) throw error;

          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        setError(error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          getUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);

  return { user, loading, error };
}
