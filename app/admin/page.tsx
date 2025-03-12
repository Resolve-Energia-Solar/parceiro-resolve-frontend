'use client';

import { useState, useEffect, useMemo, SetStateAction } from "react";
import { Header } from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Loader2, Users, PhoneCall, Clock, Ban, CheckCircle, X } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';


interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem interesse' | 'Aprovado';
  created_at: string;
  rejection_reason?: string;
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
  color: string;
}


const statusLabels = {
  'Indicação': 'Indicação',
  'Contato comercial': 'Contato Comercial',
  'Em negociação': 'Em negociação',
  'Sem interesse': 'Sem Interesse',
  'Aprovado': 'Aprovado',
};


const statusColors = {
  'Indicação': '#818CF8',
  'Contato comercial': '#FBBF24',
  'Em negociação': '#9333EA',
  'Sem interesse': '#F87171',
  'Aprovado': '#34D399',
};


import { LucideIcon } from 'lucide-react';


interface StatusCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}


const StatusCard = ({ icon: Icon, label, value, color }: StatusCardProps) => (
  <Card style={{ backgroundColor: color }} className="shadow-lg">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-1 text-white opacity-90">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <Icon className="text-white opacity-75" size={40} />
      </div>
    </CardContent>
  </Card>
);


interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}


const ChartCard = ({ title, children }: ChartCardProps) => (
  <Card className="bg-gray-800 shadow-lg">
    <CardHeader>
      <CardTitle className="text-xl font-semibold text-indigo-400">{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-80">{children}</CardContent>
  </Card>
);


interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectionModal = ({ isOpen, onClose, onConfirm }: RejectionModalProps) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Motivo da Rejeição</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-2">
            Por favor, informe o motivo da rejeição desta indicação:
          </p>
          <Textarea
            value={reason}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setReason(e.target.value)}
            placeholder="Descreva o motivo da rejeição..."
            className="w-full bg-gray-700 border-gray-600 text-white"
            rows={4}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason);
                setReason('');
              } else {
                toast.error("Por favor, informe o motivo da rejeição");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};


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

  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [currentReferralId, setCurrentReferralId] = useState<string | null>(null);

  if (!user || (user.user_type !== 'Admin' && user.user_type !== 'SDR')) {
    if (typeof window !== 'undefined') {
      router.push('/dashboard');
    }

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      if (user?.user_type !== 'Admin' && user?.user_type !== 'SDR') {
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
        const statusCount: { [key: string]: number } = { 'Indicação': 0, 'Contato comercial': 0, 'Em negociação': 0, 'Sem interesse': 0, 'Aprovado': 0 };
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
        setStatusData(Object.entries(statusCount).map(([name, value]) => ({
          name: statusLabels[name as keyof typeof statusLabels],
          value,
          color: statusColors[name as keyof typeof statusColors]
        })));

        setMonthlyData(Object.entries(monthlyCount)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }))
        );

        setTopPartners(
          Object.entries(partnerData)
            .sort(([, a], [, b]) => b - a)
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

  const handleStatusChange = (referralId: string, newStatus: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem interesse' | 'Aprovado') => {
    if (newStatus === 'Sem interesse') {
      setCurrentReferralId(referralId);
      setIsRejectionModalOpen(true);
    } else {
      updateReferralStatus(referralId, newStatus);
    }
  };

  const handleRejectionConfirm = async (reason: string) => {
    if (currentReferralId) {
      try {
        const { error } = await supabase
          .from('referrals')
          .update({ 
            status: 'Sem interesse',
            rejection_reason: reason 
          })
          .eq('id', currentReferralId);
  
        if (error) throw error;
  
        toast.success('Indicação rejeitada com sucesso');
        
        setReferrals(prev => {
          const updated = prev.map(ref => 
            ref.id === currentReferralId ? { 
              ...ref, 
              status: 'Sem interesse' as 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem interesse' | 'Aprovado', 
              rejection_reason: reason 
            } : ref
          );
          
          recalculateStatusData(updated);
          
          return updated;
        });
        
        setIsRejectionModalOpen(false);
        setCurrentReferralId(null);
      } catch (error: any) {
        console.error('Erro ao rejeitar indicação:', error);
        toast.error('Erro ao rejeitar indicação');
      }
    }
  };
  

  const updateReferralStatus = async (referralId: string, newStatus: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem interesse' | 'Aprovado') => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({ status: newStatus })
        .eq('id', referralId);

      if (error) throw error;

      toast.success(`Status atualizado para ${statusLabels[newStatus]}`);

      setReferrals(prev => {
        const updated = prev.map(ref =>
          ref.id === referralId ? { ...ref, status: newStatus as 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem interesse' | 'Aprovado' } : ref
        );

        recalculateStatusData(updated);

        return updated;
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const recalculateStatusData = (referrals: Referral[]) => {
    const statusCount: { [key: string]: number } = {
      'Indicação': 0,
      'Contato comercial': 0,
      'Em negociação': 0,
      'Sem interesse': 0,
      'Aprovado': 0
    };

    referrals.forEach(referral => {
      statusCount[referral.status] += 1;
    });

    setStatusData(Object.entries(statusCount).map(([name, value]) => ({
      name: statusLabels[name as keyof typeof statusLabels],
      value,
      color: statusColors[name as keyof typeof statusColors]
    })));
  };

  const filteredReferrals = useMemo(() => {
    return referrals.filter(referral => {
      return (selectedUnit === 'all' || referral.referrer.unit.id === selectedUnit) &&
        (selectedStatus === 'all' || referral.status === selectedStatus) &&
        (!searchTerm || referral.referrer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          referral.referred_user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [referrals, selectedUnit, selectedStatus, searchTerm]);

  const currentReferrals = useMemo(() => {
    return filteredReferrals.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredReferrals, currentPage, itemsPerPage]);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatusCard icon={Users} label="Indicação" value={statusData.find(s => s.name === 'Indicação')?.value || 0} color={statusColors['Indicação']} />
          <StatusCard icon={PhoneCall} label="Contato Comercial" value={statusData.find(s => s.name === 'Contato Comercial')?.value || 0} color={statusColors['Contato comercial']} />
          <StatusCard icon={Clock} label="Em negociação" value={statusData.find(s => s.name === 'Em negociação')?.value || 0} color={statusColors['Em negociação']} />
          <StatusCard icon={Ban} label="Sem Interesse" value={statusData.find(s => s.name === 'Sem Interesse')?.value || 0} color={statusColors['Sem interesse']} />
          <StatusCard icon={CheckCircle} label="Aprovado" value={statusData.find(s => s.name === 'Aprovado')?.value || 0} color={statusColors['Aprovado']} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard title="Indicações por Unidade">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }} />
                <Legend />
                <Bar dataKey="value" fill="#818CF8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Evolução Mensal das Indicações">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }} />
                <Legend />
                <Area type="monotone" dataKey="count" stroke="#34D399" fill="#34D399" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Top 5 Parceiros">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPartners} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }} />
                <Legend />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Distribuição de Status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={30}
                  fill="#8884d8"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}`, '']}
                  contentStyle={{ backgroundColor: '#1F2937', color: 'white' }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <Card className="bg-gray-800 shadow-lg overflow-hidden mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-400">Indicações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <Input
                placeholder="Buscar por nome"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-gray-700 text-gray-100 border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700 text-gray-100 border-gray-600">
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                    <SelectItem value="all">Todas</SelectItem>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700 text-gray-100 border-gray-600">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
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
                    <tr key={referral.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-100">{referral.referrer.name}</div>
                        <div className="text-sm text-gray-400">{referral.referrer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-100">{referral.referred_user.name}</div>
                        <div className="text-sm text-gray-400">{referral.referred_user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className="px-2 py-1 text-xs font-semibold rounded-full text-white w-fit"
                            style={{ backgroundColor: statusColors[referral.status] }}
                          >
                            {statusLabels[referral.status]}
                          </span>
                          {referral.rejection_reason && (
                            <span className="text-xs text-gray-400 mt-1">
                              Motivo: {referral.rejection_reason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center text-white gap-2">
                          <Select
                            defaultValue={referral.status}
                            onValueChange={(value) => handleStatusChange(referral.id, value as any)}
                          >
                            <SelectTrigger
                              className="w-[140px]"
                              style={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: statusColors[referral.status as keyof typeof statusColors] || '#6B7280',
                                borderWidth: "1.5px"
                              }}
                            >
                              <SelectValue placeholder="Alterar status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem
                                value="Indicação"
                                className="hover:bg-gray-600 text-white"
                                disabled={referral.status === 'Indicação'}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Indicação'] }}></span>
                                  Indicação
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="Contato comercial"
                                className="hover:bg-gray-600 text-white"
                                disabled={referral.status === 'Contato comercial'}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Contato comercial'] }}></span>
                                  Contato comercial
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="Em negociação"
                                className="hover:bg-gray-600 text-white"
                                disabled={referral.status === 'Em negociação'}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Em negociação'] }}></span>
                                  Em negociação
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="Sem interesse"
                                className="hover:bg-gray-600 text-white"
                                disabled={referral.status === 'Sem interesse'}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Sem interesse'] }}></span>
                                  Sem interesse
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="Aprovado"
                                className="hover:bg-gray-600 text-white"
                                disabled={referral.status === 'Aprovado'}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Aprovado'] }}></span>
                                  Aprovado
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">
              Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredReferrals.length)}</span> de <span className="font-medium">{filteredReferrals.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md gap-3 shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:opacity-50"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentPage(prev =>
                  prev < Math.ceil(filteredReferrals.length / itemsPerPage) ? prev + 1 : prev
                )}
                disabled={currentPage >= Math.ceil(filteredReferrals.length / itemsPerPage)}
                className="relative inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:opacity-50"
              >
                Próximo
              </Button>
            </nav>
          </div>
        </Card>
      </div>

      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        onConfirm={handleRejectionConfirm}
      />
    </div>
  );
}
