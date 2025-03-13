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
import { LucideIcon } from 'lucide-react';
import { Tooltip as CustomTooltip } from '@/components/ui/Tooltip';

interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem Interesse ou Reprovado' | 'Aprovado';
  created_at: string;
  rejection_reason?: string;
  referrer: {
    name: string;
    email: string;
    unit_id: string;
    unit: {
      id: string;
      name: string;
    }
  };
  referred_user: {
    cpf: string;
    telefone: string;
    name: string;
    email: string;
    unit_id: string;
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
  'Sem Interesse ou Reprovado': 'Sem Interesse ou Reprovado',
  'Aprovado': 'Aprovado',
};

const statusColors = {
  'Indicação': '#818CF8',
  'Contato comercial': '#FBBF24',
  'Em negociação': '#9333EA',
  'Sem Interesse ou Reprovado': '#F87171',
  'Aprovado': '#34D399',
};

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
  const [userUnitId, setUserUnitId] = useState<string | null>(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [currentReferralId, setCurrentReferralId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);


  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "—";

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
    } else if (cleaned.length === 8) {
      return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}`;
    } else {
      return phone;
    }
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return "—";

    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 11)}`;
    } else {
      return cpf;
    }
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (user.user_type !== 'Admin' && user.user_type !== 'SDR' && user.user_type !== 'Super admin') {
        router.push('/dashboard');
        return;
      }

      setIsAuthorized(true);

      try {
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('*')
          .order('name');

        if (unitsError) throw unitsError;
        setUnits(unitsData || []);

        let userUnitIdValue: any = null;

        if (user.user_type === 'SDR') {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*, unit_id')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;

          if (userData && userData.unit_id) {
            userUnitIdValue = userData.unit_id;
            setUserUnitId(userData.unit_id);
            setSelectedUnit(userData.unit_id);
            console.log("SDR da unidade:", userData.unit_id);
          }
        }

        const { data: allReferralsData, error: referralsError } = await supabase
          .from('referrals')
          .select(`
            *, 
            referrer:users!referrer_id (name, email, unit_id, unit:units(id, name)),
            referred_user:users!referred_user_id (name, email, cpf, telefone, unit_id, unit:units(id, name))
          `)
          .order('created_at', { ascending: false });

        if (referralsError) {
          console.error("Erro na consulta de referrals:", referralsError);
          throw referralsError;
        }

        console.log("Total de referrals obtidos:", allReferralsData?.length || 0);

        let filteredReferrals = allReferralsData || [];

        if (user.user_type === 'SDR' && userUnitIdValue) {
          filteredReferrals = filteredReferrals.filter(ref => {
            return ref.referrer?.unit_id === userUnitIdValue;
          });
          console.log("Referrals filtrados por unidade:", filteredReferrals.length);
        }

        setReferrals(filteredReferrals);

        const unitData: { [key: string]: number } = {};
        const partnerData: { [key: string]: number } = {};
        const timeSeries: { [key: string]: number } = {};
        const statusCount: { [key: string]: number } = {
          'Indicação': 0,
          'Contato comercial': 0,
          'Em negociação': 0,
          'Sem Interesse ou Reprovado': 0,
          'Aprovado': 0
        };
        const monthlyCount: { [key: string]: number } = {};

        filteredReferrals.forEach((referral: Referral) => {
          const unitName = referral.referrer?.unit?.name || "Unidade Desconhecida";
          const partnerName = referral.referrer?.name || "Parceiro Desconhecido";
          const date = new Date(referral.created_at);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          unitData[unitName] = (unitData[unitName] || 0) + 1;
          partnerData[partnerName] = (partnerData[partnerName] || 0) + 1;
          timeSeries[date.toISOString().split('T')[0]] = (timeSeries[date.toISOString().split('T')[0]] || 0) + 1;

          if (statusCount.hasOwnProperty(referral.status)) {
            statusCount[referral.status] += 1;
          } else {
            console.warn(`Status desconhecido: ${referral.status}`);
          }

          monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
        });

        setUnitChartData(Object.entries(unitData).map(([name, value]) => ({ name, value })));
        setPartnerChartData(Object.entries(partnerData).map(([name, value]) => ({ name, value })));
        setTimeSeriesData(Object.entries(timeSeries).map(([date, count]) => ({ date, count })));
        setStatusData(Object.entries(statusCount).map(([name, value]) => ({
          name: statusLabels[name as keyof typeof statusLabels] || name,
          value,
          color: statusColors[name as keyof typeof statusColors] || '#888888'
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
        toast.error('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [user, router]);

  const handleStatusChange = (referralId: string, newStatus: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem Interesse ou Reprovado' | 'Aprovado') => {
    if (newStatus === 'Sem Interesse ou Reprovado') {
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
            status: 'Sem Interesse ou Reprovado',
            rejection_reason: reason
          })
          .eq('id', currentReferralId);

        if (error) throw error;

        toast.success('Indicação rejeitada com sucesso');

        setReferrals(prev => {
          const updated = prev.map(ref =>
            ref.id === currentReferralId ? {
              ...ref,
              status: 'Sem Interesse ou Reprovado' as 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem Interesse ou Reprovado' | 'Aprovado',
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

  const updateReferralStatus = async (referralId: string, newStatus: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem Interesse ou Reprovado' | 'Aprovado') => {
    try {
      const { data: referralData, error: fetchError } = await supabase
        .from('referrals')
        .select('referrer_id, status')
        .eq('id', referralId)
        .single();

      if (fetchError) throw fetchError;

      const previousStatus = referralData?.status;

      console.log(`Atualizando status da indicação ${referralId}`);
      console.log(`Status anterior: "${previousStatus}", Novo status: "${newStatus}"`);
      console.log(`Condição de decremento: ${previousStatus === 'Aprovado' && newStatus !== 'Aprovado'}`);

      const { error } = await supabase
        .from('referrals')
        .update({ status: newStatus })
        .eq('id', referralId);

      if (error) throw error;

      if (referralData?.referrer_id) {
        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('approved_referrals')
          .eq('id', referralData.referrer_id)
          .single();

        if (userFetchError) throw userFetchError;

        const currentCount = userData?.approved_referrals || 0;
        console.log(`Contador atual de aprovações: ${currentCount}`);

        if (newStatus === 'Aprovado' && previousStatus !== 'Aprovado') {
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({ approved_referrals: currentCount + 1 })
            .eq('id', referralData.referrer_id);

          if (userUpdateError) throw userUpdateError;

          console.log(`Contador incrementado para: ${currentCount + 1}`);
        }
        else if (String(previousStatus).trim() === 'Aprovado' && newStatus !== 'Aprovado') {
          const newCount = Math.max(0, currentCount - 1);

          const { error: userUpdateError } = await supabase
            .from('users')
            .update({ approved_referrals: newCount })
            .eq('id', referralData.referrer_id);

          if (userUpdateError) throw userUpdateError;

          console.log(`Contador decrementado para: ${newCount}`);

          const { data: checkData } = await supabase
            .from('users')
            .select('approved_referrals')
            .eq('id', referralData.referrer_id)
            .single();

          console.log(`Confirmação após atualização: ${checkData?.approved_referrals}`);
        }
      }

      toast.success(`Status atualizado para ${statusLabels[newStatus]}`);

      setReferrals(prev => {
        const updated = prev.map(ref =>
          ref.id === referralId ? { ...ref, status: newStatus } : ref
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
      'Sem Interesse ou Reprovado': 0,
      'Aprovado': 0
    };

    referrals.forEach(referral => {
      if (statusCount.hasOwnProperty(referral.status)) {
        statusCount[referral.status] += 1;
      }
    });

    setStatusData(Object.entries(statusCount).map(([name, value]) => ({
      name: statusLabels[name as keyof typeof statusLabels] || name,
      value,
      color: statusColors[name as keyof typeof statusColors] || '#888888'
    })));
  };

  const filteredReferrals = useMemo(() => {
    return referrals.filter(referral => {
      const referrerUnitId = referral?.referrer?.unit_id;

      let unitMatch = true;
      if (user?.user_type === 'SDR') {
        unitMatch = referrerUnitId === userUnitId;
      } else {
        unitMatch = selectedUnit === 'all' || referrerUnitId === selectedUnit;
      }

      const statusMatch = selectedStatus === 'all' || referral.status === selectedStatus;

      const searchMatch = !searchTerm ||
        (referral.referrer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (referral.referred_user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      return unitMatch && statusMatch && searchMatch;
    });
  }, [referrals, selectedUnit, selectedStatus, searchTerm, user?.user_type, userUnitId]);

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

  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={48} />
          <p className="text-white">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {user.user_type === 'Admin'
            ? 'Dashboard de Indicações (Admin)'
            : 'Dashboard de Indicações da Sua Unidade'}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatusCard icon={Users} label="Indicação" value={statusData.find(s => s.name === 'Indicação')?.value || 0} color={statusColors['Indicação']} />
          <StatusCard icon={PhoneCall} label="Contato Comercial" value={statusData.find(s => s.name === 'Contato Comercial')?.value || 0} color={statusColors['Contato comercial']} />
          <StatusCard icon={Clock} label="Em negociação" value={statusData.find(s => s.name === 'Em negociação')?.value || 0} color={statusColors['Em negociação']} />
          <StatusCard icon={Ban} label="Sem Interesse ou Reprovado" value={statusData.find(s => s.name === 'Sem Interesse ou Reprovado')?.value || 0} color={statusColors['Sem Interesse ou Reprovado']} />
          <StatusCard icon={CheckCircle} label="Aprovado" value={statusData.find(s => s.name === 'Aprovado')?.value || 0} color={statusColors['Aprovado']} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {user.user_type === 'Admin' && (
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
          )}

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
                {user.user_type === 'Admin' && (
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
                )}
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
            <div className="rounded-lg overflow-hidden shadow-md border border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Indicador
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Indicado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {currentReferrals.length > 0 ? (
                      currentReferrals.map((referral) => (
                        <tr key={referral.id} className="hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-100">{referral.referrer?.name || "—"}</div>
                            <div className="text-sm text-gray-400">{referral.referrer?.email || "—"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <CustomTooltip content={
                              <div className="flex flex-col gap-1">
                                <p><strong>Telefone:</strong> {formatPhoneNumber(referral.referred_user?.telefone) || "—"}</p>
                                <p><strong>CPF:</strong> {formatCPF(referral.referred_user?.cpf) || "—"}</p>
                              </div>
                            }>
                              <div className="cursor-help">
                                <div className="text-sm font-medium text-gray-100">{referral.referred_user?.name || "—"}</div>
                                <div className="text-sm text-gray-400">{referral.referred_user?.email || "—"}</div>
                              </div>
                            </CustomTooltip>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span
                                className="px-2 py-1 text-xs font-semibold rounded-full text-white w-fit"
                                style={{ backgroundColor: statusColors[referral.status] || '#888888' }}
                              >
                                {statusLabels[referral.status] || referral.status}
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
                                    value="Sem Interesse ou Reprovado"
                                    className="hover:bg-gray-600 text-white"
                                    disabled={referral.status === 'Sem Interesse ou Reprovado'}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Sem Interesse ou Reprovado'] }}></span>
                                      Sem Interesse ou Reprovado
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          Nenhuma indicação encontrada com os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </CardContent>
        </Card>

        {filteredReferrals.length > 0 && (
          <Card className="bg-gray-800 p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">
                Mostrando <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredReferrals.length)}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredReferrals.length)}</span> de <span className="font-medium">{filteredReferrals.length}</span> resultados
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
        )}
      </div>

      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        onConfirm={handleRejectionConfirm}
      />
    </div>
  );
}
