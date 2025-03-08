'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Loader2, Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

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

interface ChartData {
  name: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

interface StatusData {
  name: string;
  value: number;
}

export default function AdminPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [unitChartData, setUnitChartData] = useState<ChartData[]>([]);
  const [partnerChartData, setPartnerChartData] = useState<ChartData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; count: number }[]>([]);
  const [topPartners, setTopPartners] = useState<{ name: string; count: number }[]>([]);

  const statusLabels = {
    'pending': 'Em análise',
    'approved': 'Aprovado',
    'rejected': 'Rejeitado'
  };

  const statusColors = {
    'pending': '#6366F1',
    'approved': '#10B981',
    'rejected': '#EF4444'
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user?.user_type !== 'Admin') {
        router.push('/dashboard');
        return;
      }

      try {
        const [unitsResponse, referralsResponse] = await Promise.all([
          supabase.from('units').select('*').order('name'),
          supabase.from('referrals').select(`
            *, referrer:users!referrer_id (name, email, unit:units(id, name)),
            referred_user:users!referred_user_id (name, email, unit:units(id, name))
          `).order('created_at', { ascending: false })
        ]);

        if (unitsResponse.error) throw unitsResponse.error;
        if (referralsResponse.error) throw referralsResponse.error;

        setUnits(unitsResponse.data || []);
        setReferrals(referralsResponse.data || []);

        const unitData: { [key: string]: number } = {};
        const partnerData: { [key: string]: number } = {};
        const timeSeries: { [key: string]: number } = {};
        const statusCount: { [key: string]: number } = { 'pending': 0, 'approved': 0, 'rejected': 0 };
        const monthlyCount: { [key: string]: number } = {};

        referralsResponse.data?.forEach((referral: Referral) => {
          const unitName = referral.referrer.unit.name;
          const partnerName = referral.referrer.name;
          const date = new Date(referral.created_at);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          unitData[unitName] = (unitData[unitName] || 0) + 1;
          partnerData[partnerName] = (partnerData[partnerName] || 0) + 1;
          timeSeries[date.toISOString().split('T')[0]] = (timeSeries[date.toISOString().split('T')[0]] || 0) + 1;
          statusCount[referral.status] += 1;
          monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
        });

        setUnitChartData(Object.entries(unitData).map(([name, value]) => ({ name, value })));
        setPartnerChartData(Object.entries(partnerData).map(([name, value]) => ({ name, value })));
        setTimeSeriesData(Object.entries(timeSeries).map(([date, count]) => ({ date, count })));
        setStatusData(Object.entries(statusCount).map(([name, value]) => ({ name: statusLabels[name as keyof typeof statusLabels], value })));
        
        setMonthlyData(Object.entries(monthlyCount)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }))
        );

        setTopPartners(
          Object.entries(partnerData)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }))
        );

      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const updateReferralStatus = async (referralId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({ status: newStatus })
        .eq('id', referralId);

      if (error) throw error;

      toast.success(`Status atualizado para ${statusLabels[newStatus]}`);
      setReferrals(prev => prev.map(ref => ref.id === referralId ? { ...ref, status: newStatus } : ref));
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const filteredReferrals = referrals.filter(referral => {
    return (selectedUnit === 'all' || referral.referrer.unit.id === selectedUnit) &&
           (selectedStatus === 'all' || referral.status === selectedStatus) &&
           (!searchTerm || referral.referrer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            referral.referred_user.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const currentReferrals = filteredReferrals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard de Indicações</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-indigo-600 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-100 mb-1">Total de Indicações</p>
                <p className="text-3xl font-bold">{referrals.length}</p>
              </div>
              <Users className="text-indigo-200" size={40} />
            </div>
          </div>
          <div className="bg-green-600 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100 mb-1">Aprovadas</p>
                <p className="text-3xl font-bold">{referrals.filter(r => r.status === 'approved').length}</p>
              </div>
              <CheckCircle className="text-green-200" size={40} />
            </div>
          </div>
          <div className="bg-yellow-600 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-100 mb-1">Pendentes</p>
                <p className="text-3xl font-bold">{referrals.filter(r => r.status === 'pending').length}</p>
              </div>
              <TrendingUp className="text-yellow-200" size={40} />
            </div>
          </div>
          <div className="bg-red-600 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100 mb-1">Rejeitadas</p>
                <p className="text-3xl font-bold">{referrals.filter(r => r.status === 'rejected').length}</p>
              </div>
              <XCircle className="text-red-200" size={40} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Indicações por Unidade</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend />
                  <Bar dataKey="value" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Evolução Mensal das Indicações</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend />
                  <Area type="monotone" dataKey="count" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Indicações</h2>
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Buscar por nome"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-700 text-gray-100"
              />
              <div className="flex space-x-2">
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-40 bg-gray-700 text-gray-100">
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-gray-100">
                    <SelectItem value="all">Todas</SelectItem>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40 bg-gray-700 text-gray-100">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-gray-100">
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Indicador</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Indicado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {currentReferrals.map((referral) => (
                    <tr key={referral.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-100">{referral.referrer.name}</div>
                        <div className="text-sm text-gray-400">{referral.referrer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-100">{referral.referred_user.name}</div>
                        <div className="text-sm text-gray-400">{referral.referred_user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[referral.status]}`}>
                          {statusLabels[referral.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => updateReferralStatus(referral.id, 'approved')}
                          disabled={referral.status === 'approved'}
                          className="mr-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => updateReferralStatus(referral.id, 'rejected')}
                          disabled={referral.status === 'rejected'}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Rejeitar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">
              Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredReferrals.length)}</span> de <span className="font-medium">{filteredReferrals.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md gap-5 shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-700 text-sm font-medium text-gray-100 hover:bg-gray-600"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => 
                  prev < Math.ceil(filteredReferrals.length / itemsPerPage) ? prev + 1 : prev
                )}
                disabled={currentPage >= Math.ceil(filteredReferrals.length / itemsPerPage)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-700 text-sm font-medium text-gray-100 hover:bg-gray-600"
              >
                Próximo
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
          