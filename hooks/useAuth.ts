'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      setUser(session?.user ?? null);
      checkUserProfile(session?.user?.id);
    };
    
    fetchSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        checkUserProfile(session?.user?.id);
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  const checkUserProfile = async (userId: string | undefined) => {
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching user type:', error);
        } else {
          setUserType(data?.user_type);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setUserType(undefined);
      setLoading(false);
    }
  };
  
  return {
    user,
    userType,
    loading,
  };
};
