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
      fetchReferrals(); 
    }
  };

  if (!user?.is_super_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1A1A1A] shadow-xl rounded-lg overflow-hidden border border-[#333]">
          <div className="bg-[#FFC700] text-black px-6 py-4">
            <h1 className="text-2xl font-bold">Painel de Administração - Indicações</h1>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-400">Carregando indicações...</p>
            </div>
          ) : (
            <div className="divide-y divide-[#333]">
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Nenhuma indicação encontrada
                </div>
              ) : (
                referrals.map((referral) => (
                  <div 
                    key={referral.id} 
                    className="px-6 py-4 hover:bg-[#222] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#FFC700]">
                          Indicador: {referral.referrer.name}
                        </p>
                        <p className="text-sm text-gray-300">
                          {referral.referrer.email}
                        </p>
                        <p className="mt-2 text-sm text-[#FFC700]">
                          Indicado: {referral.referred_user.name}
                        </p>
                        <p className="text-sm text-gray-300">
                          {referral.referred_user.email}
                        </p>
                        <div className="mt-2">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-semibold 
                              ${
                                referral.status === 'pending' 
                                  ? 'bg-yellow-800 text-yellow-300'
                                  : referral.status === 'approved'
                                  ? 'bg-green-800 text-green-300'
                                  : 'bg-red-800 text-red-300'
                              }`}
                          >
                            {referral.status === 'pending' 
                              ? 'Pendente' 
                              : referral.status === 'approved' 
                              ? 'Aprovado' 
                              : 'Rejeitado'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(referral.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => updateReferralStatus(referral.id, 'approved')}
                          disabled={referral.status === 'approved'}
                          className={`
                            ${
                              referral.status === 'approved'
                                ? 'bg-green-900 text-green-500 cursor-not-allowed'
                                : 'bg-[#FFC700] text-black hover:bg-yellow-500'
                            } 
                            px-4 py-2 rounded-md transition-colors font-bold
                          `}
                        >
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => updateReferralStatus(referral.id, 'rejected')}
                          disabled={referral.status === 'rejected'}
                          className={`
                            ${
                              referral.status === 'rejected'
                                ? 'bg-red-900 text-red-500 cursor-not-allowed'
                                : 'bg-red-700 text-white hover:bg-red-600'
                            } 
                            px-4 py-2 rounded-md transition-colors font-bold
                          `}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
