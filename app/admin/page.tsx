"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  referrer: { name: string; email: string };
  referred_user: { name: string; email: string };
}

export default function AdminPage() {
  const { user } = useUser();
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_super_admin) {
      router.push('/admin');
    } else {
      fetchReferrals();
    }
  }, [user, router]);

  const fetchReferrals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referrer:users!referrer_id (name, email),
        referred_user:users!referred_user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      toast.error('Erro ao carregar indicações');
    } else {
      setReferrals(data || []);
    }
    setIsLoading(false);
  };

  const updateReferralStatus = async (referralId: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('referrals')
      .update({ status: newStatus })
      .eq('id', referralId);

    if (error) {
      console.error('Error updating referral status:', error);
      toast.error('Erro ao atualizar status da indicação');
    } else {
      toast.success(`Status da indicação atualizado para ${newStatus}`);
      fetchReferrals(); // Recarrega a lista de indicações
    }
  };

  if (!user?.is_super_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <h1 className="text-2xl font-bold mb-6">Painel de Administração - Indicações</h1>
        {isLoading ? (
          <p>Carregando indicações...</p>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {referrals.map((referral) => (
                <li key={referral.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">
                        Indicador: {referral.referrer.name} ({referral.referrer.email})
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Indicado: {referral.referred_user.name} ({referral.referred_user.email})
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Status: {referral.status}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Data: {new Date(referral.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => updateReferralStatus(referral.id, 'approved')}
                        disabled={referral.status === 'approved'}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => updateReferralStatus(referral.id, 'rejected')}
                        disabled={referral.status === 'rejected'}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
