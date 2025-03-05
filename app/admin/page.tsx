'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Loader2, Filter, ArrowUpDown } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  referrer: { 
    name: string; 
    email: string; 
    unit: { 
      id: string;
      name: string; 
    } 
  };
  referred_user: { 
    name: string; 
    email: string; 
    unit: { 
      id: string;
      name: string; 
    } 
  };
}

interface Unit {
  id: string;
  name: string;
}

export default function AdminPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const statusLabels = {
    'pending': 'Pendente',
    'approved': 'Aprovado',
    'rejected': 'Rejeitado'
  };

  const statusColors = {
    'pending': 'bg-yellow-800 text-yellow-300',
    'approved': 'bg-green-800 text-green-300',
    'rejected': 'bg-red-800 text-red-300'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unitsResponse = await supabase
          .from('units')
          .select('*')
          .eq('active', true)
          .order('name');

        if (unitsResponse.error) throw unitsResponse.error;
        setUnits(unitsResponse.data || []);

        const referralsResponse = await supabase
          .from('referrals')
          .select(`
            *,
            referrer:users!referrer_id (
              name, 
              email, 
              unit:units(id, name)
            ),
            referred_user:users!referred_user_id (
              name, 
              email, 
              unit:units(id, name)
            )
          `)
          .order('created_at', { ascending: false });

        if (referralsResponse.error) throw referralsResponse.error;
        setReferrals(referralsResponse.data || []);
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    };

    if (user !== undefined) {
      setIsInitialLoading(false);
    }

    if (user && user.user_type !== 'Admin') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [user, router]);

  const updateReferralStatus = async (referralId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({ status: newStatus })
        .eq('id', referralId);

      if (error) throw error;

      toast.success(`Status da indicação atualizado para ${statusLabels[newStatus]}`);
      
      setReferrals(prevReferrals => 
        prevReferrals.map(referral => 
          referral.id === referralId 
            ? { ...referral, status: newStatus } 
            : referral
        )
      );
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da indicação');
    }
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesUnit = selectedUnit === 'all' || 
      referral.referrer.unit.id === selectedUnit;
    
    const matchesStatus = selectedStatus === 'all' || 
      referral.status === selectedStatus;
    
    const matchesSearch = !searchTerm || 
      referral.referrer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referred_user.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesUnit && matchesStatus && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReferrals = filteredReferrals.slice(indexOfFirstItem, indexOfLastItem);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1A1A1A] shadow-xl rounded-lg overflow-hidden border border-[#333]">
          <div className="bg-[#FFC700] text-black px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Painel de Administração - Indicações</h1>
            <div className="flex space-x-2">
              <Input 
                placeholder="Buscar por nome" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
              <Select 
                value={selectedUnit} 
                onValueChange={setSelectedUnit}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Unidades</SelectItem>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="divide-y divide-[#333]">
            {currentReferrals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nenhuma indicação encontrada
              </div>
            ) : (
              currentReferrals.map((referral) => (
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
                        <span className="ml-2 text-xs text-gray-500">
                          {referral.referrer.unit.name} 
                        </span>
                      </p>
                      <p className="mt-2 text-sm text-[#FFC700]">
                        Indicado: {referral.referred_user.name}
                      </p>
                      <p className="text-sm text-gray-300">
                        {referral.referred_user.email}
                        <span className="ml-2 text-xs text-gray-500">
                          {referral.referred_user.unit.name}
                        </span>
                      </p>
                      <div className="mt-2">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-semibold 
                            ${statusColors[referral.status]}`}
                        >
                          {statusLabels[referral.status]}
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

          <div className="flex justify-between items-center p-4">
            <div className="text-sm text-gray-400">
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredReferrals.length)} de {filteredReferrals.length}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => 
                  prev < Math.ceil(filteredReferrals.length / itemsPerPage) 
                    ? prev + 1 
                    : prev
                )}
                disabled={currentPage >= Math.ceil(filteredReferrals.length / itemsPerPage)}
                variant="outline"
              >
                Próximo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
