'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { 
  Loader2, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle 
} from "lucide-react";
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
    'pending': 'em análise',
    'approved': 'Aprovado',
    'rejected': 'Rejeitado'
  };

  const statusColors = {
    'pending': 'bg-indigo-900 text-indigo-300',
    'approved': 'bg-emerald-900 text-emerald-300',
    'rejected': 'bg-rose-900 text-rose-300'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unitsResponse = await supabase
          .from('units')
          .select('*')
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
      <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1E1E1E] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1E1E1E] text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1E1E1E] shadow-2xl rounded-2xl overflow-hidden border border-[#333]">
          <div className="bg-[#2C2C2C] text-white px-6 py-5 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-100">Painel de Administração</h1>
              <span className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-full">
                Indicações
              </span>
            </div>
            
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Buscar por nome" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#3A3A3A] border-[#444] text-white placeholder-gray-400 w-[250px]"
                />
              </div>

              <Select 
                value={selectedUnit} 
                onValueChange={setSelectedUnit}
              >
                <SelectTrigger className="w-[200px] bg-[#3A3A3A] border-[#444] text-white">
                  <Filter className="mr-2 text-gray-400" size={16} />
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2C2C] border-[#444]">
                  <SelectItem value="all" className="text-white hover:bg-[#3C3C3C]">
                    Todas as Unidades
                  </SelectItem>
                  {units.map(unit => (
                    <SelectItem 
                      key={unit.id} 
                      value={unit.id} 
                      className="text-white hover:bg-[#3C3C3C]"
                    >
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-[180px] bg-[#3A3A3A] border-[#444] text-white">
                  <Filter className="mr-2 text-gray-400" size={16} />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2C2C] border-[#444]">
                  <SelectItem value="all" className="text-white hover:bg-[#3C3C3C]">
                    Todos os Status
                  </SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem 
                      key={key} 
                      value={key} 
                      className="text-white hover:bg-[#3C3C3C]"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="divide-y divide-[#333]">
            {currentReferrals.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-[#1E1E1E]">
                Nenhuma indicação encontrada
              </div>
            ) : (
              currentReferrals.map((referral) => (
                <div 
                  key={referral.id} 
                  className="px-6 py-4 hover:bg-[#2A2A2A] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-400">
                        Indicador: {referral.referrer.name}
                      </p>
                      <p className="text-sm text-gray-300">
                        {referral.referrer.email}
                      </p>
                      <p className="mt-2 text-sm text-indigo-400">
                        Indicado: {referral.referred_user.name}
                      </p>
                      <p className="text-sm text-gray-300">
                        {referral.referred_user.email}
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
                              ? 'bg-emerald-900 text-emerald-500 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
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
                              ? 'bg-rose-900 text-rose-500 cursor-not-allowed'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
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

          <div className="flex justify-between items-center p-4 bg-[#2C2C2C]">
            <div className="text-sm text-gray-400">
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredReferrals.length)} de {filteredReferrals.length}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="bg-[#3A3A3A] text-white hover:bg-[#4A4A4A]"
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
                className="bg-[#3A3A3A] text-white hover:bg-[#4A4A4A]"
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
