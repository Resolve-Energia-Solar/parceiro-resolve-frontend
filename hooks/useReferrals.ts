'use client';


import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";
import { Referral, ChartData, StatusData, RankingData, statusLabels, statusColors } from "@/constants/referral-constants";

interface UseReferralsProps {
    userId: string | undefined;
    userType: string | undefined;
}

export const useReferrals = ({ userId, userType }: UseReferralsProps) => {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [unitChartData, setUnitChartData] = useState<ChartData[]>([]);
    const [statusData, setStatusData] = useState<StatusData[]>([]);
    const [userUnitId, setUserUnitId] = useState<string | null>(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [currentReferralId, setCurrentReferralId] = useState<string | null>(null);
    const [partnersRanking, setPartnersRanking] = useState<RankingData[]>([]);
    const [clientsRanking, setClientsRanking] = useState<RankingData[]>([]);

    

    const canApproveReferrals = useMemo(() => {
        return userType === 'Admin' ||
            userType === 'Super admin' ||
            userType === 'Contratos';
    }, [userType]);

    const allowedStatusForUser = useMemo(() => {
        switch (userType) {
            case "SDR":
                return ["Contato comercial", "Em negociação", "Sem Interesse ou Reprovado"];
            case "Contratos":
                return ["Sem Interesse ou Reprovado", "Aprovado"];
            case "Admin":
            case "Super admin":
                return ["Indicação", "Contato comercial", "Em negociação", "Sem Interesse ou Reprovado", "Aprovado"];
            default:
                return [];
        }
    }, [userType]);

    console.log("User Type:", userType);
console.log("Allowed Status for User:", allowedStatusForUser);
console.log("Referral Status:", referrals);
console.log("Can Select 'Sem Interesse ou Reprovado':", allowedStatusForUser.includes("Sem Interesse ou Reprovado"));

    
    
    

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);

                const { data: unitsData, error: unitsError } = await supabase
                    .from('units')
                    .select('*')
                    .order('name');

                if (unitsError) throw unitsError;
                setUnits(unitsData || []);

                let userUnitIdValue: any = null;

                if (userType === 'SDR') {
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('*, unit_id')
                        .eq('id', userId)
                        .single();

                    if (userError) throw userError;

                    if (userData && userData.unit_id) {
                        userUnitIdValue = userData.unit_id;
                        setUserUnitId(userData.unit_id);
                        setSelectedUnit(userData.unit_id);
                    }
                }

                const { data: allReferralsData, error: referralsError } = await supabase
                    .from('referrals')
                    .select(`
            *, 
            referrer:users!referrer_id (id, name, email, telefone, cpf, unit_id, is_resolve_customer, energy_bill, unit:units(id, name)),
            referred_user:users!referred_user_id (id, name, email, cpf, telefone, unit_id, is_resolve_customer, energy_bill, unit:units(id, name))
          `)
                    .order('created_at', { ascending: false });

                if (referralsError) throw referralsError;

                let filteredReferrals = allReferralsData || [];

                if (userType === 'SDR' && userUnitIdValue) {
                    filteredReferrals = filteredReferrals.filter(ref => {
                        return ref.referrer?.unit_id === userUnitIdValue;
                    });
                }

                setReferrals(filteredReferrals);

                processStatistics(filteredReferrals);
            } catch (error: any) {
                console.error('Error loading data:', error);
                toast.error('Error loading data: ' + (error.message || 'Unknown error'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId, userType]);

    const processStatistics = (referralsData: Referral[]) => {
        const unitData: { [key: string]: number } = {};
        const statusCount: { [key: string]: number } = {
            'Indicação': 0,
            'Contato comercial': 0,
            'Em negociação': 0,
            'Sem Interesse ou Reprovado': 0,
            'Aprovado': 0
        };

        const partnerStats: { [key: string]: RankingData } = {};
        const clientStats: { [key: string]: RankingData } = {};

        referralsData.forEach((referral: Referral) => {
            const unitName = referral.referrer?.unit?.name || "Unidade Desconhecida";

            unitData[unitName] = (unitData[unitName] || 0) + 1;

            if (statusCount.hasOwnProperty(referral.status)) {
                statusCount[referral.status] += 1;
            }

            if (referral.referrer?.id && referral.referrer?.is_resolve_customer !== true) {
                const partnerId = referral.referrer.id;

                if (!partnerStats[partnerId]) {
                    partnerStats[partnerId] = {
                        id: partnerId,
                        name: referral.referrer.name || 'Desconhecido',
                        email: referral.referrer.email || '-',
                        telefone: referral.referrer.telefone || '-',
                        energy_bill: referral.referrer.energy_bill || '-',
                        total: 0,
                        approved: 0,
                        conversion: 0,
                        unit_name: referral.referrer.unit?.name || 'Desconhecida'
                    };
                }

                partnerStats[partnerId].total += 1;

                if (referral.status === 'Aprovado') {
                    partnerStats[partnerId].approved += 1;
                }
            }

            if (referral.referrer?.id && referral.referrer?.is_resolve_customer === true) {
                const clientId = referral.referrer.id;

                if (!clientStats[clientId]) {
                    clientStats[clientId] = {
                        id: clientId,
                        name: referral.referrer.name || 'Desconhecido',
                        email: referral.referrer.email || '-',
                        telefone: referral.referrer.telefone || '-',
                        energy_bill: referral.referrer.energy_bill || '-',
                        total: 0,
                        approved: 0,
                        conversion: 0,
                        unit_name: referral.referrer.unit?.name || 'Desconhecida'
                    };
                }

                clientStats[clientId].total += 1;

                if (referral.status === 'Aprovado') {
                    clientStats[clientId].approved += 1;
                }
            }
        });

        Object.values(partnerStats).forEach(partner => {
            partner.conversion = partner.total > 0
                ? (partner.approved / partner.total) * 100
                : 0;
        });

        Object.values(clientStats).forEach(client => {
            client.conversion = client.total > 0
                ? (client.approved / client.total) * 100
                : 0;
        });

        const unitChartArray = Object.entries(unitData)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const statusDataArray = Object.entries(statusCount).map(([name, value]) => ({
            name,
            value,
            color: statusColors[name as keyof typeof statusColors]
        }));

        const partnersArray = Object.values(partnerStats)
            .sort((a, b) => b.total - a.total || b.approved - a.approved);

        const clientsArray = Object.values(clientStats)
            .sort((a, b) => b.total - a.total || b.approved - a.approved);

        setUnitChartData(unitChartArray);
        setStatusData(statusDataArray);
        setPartnersRanking(partnersArray);
        setClientsRanking(clientsArray);
    };

    const filteredReferrals = useMemo(() => {
        if (!referrals) return [];

        let result = [...referrals];

        if (selectedUnit !== 'all') {
            result = result.filter(ref => ref.referrer?.unit_id === selectedUnit);
        }

        if (selectedStatus !== 'all') {
            result = result.filter(ref => ref.status === selectedStatus);
        }

        if (searchTerm.trim() !== '') {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                ref =>
                    ref.referrer?.name?.toLowerCase().includes(search) ||
                    ref.referrer?.email?.toLowerCase().includes(search) ||
                    ref.referrer?.telefone?.includes(search) ||
                    ref.referred_user?.name?.toLowerCase().includes(search) ||
                    ref.referred_user?.email?.toLowerCase().includes(search) ||
                    ref.referred_user?.telefone?.includes(search)
            );
        }

        return result;
    }, [referrals, selectedUnit, selectedStatus, searchTerm]);

    const totalItems = filteredReferrals.length;
    const paginatedReferrals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredReferrals.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredReferrals, currentPage, itemsPerPage]);

    const updateReferralStatus = async (referralId: string, newStatus: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem Interesse ou Reprovado' | 'Aprovado') => {
        try {
            if (newStatus === 'Sem Interesse ou Reprovado') {
                setCurrentReferralId(referralId);
                setIsRejectionModalOpen(true);
                return;
            }

            if (newStatus === 'Aprovado' && !canApproveReferrals) {
                toast.error('Você não tem permissão para aprovar indicações');
                return;
            }

            const { data, error } = await supabase
                .from('referrals')
                .update({ status: newStatus })
                .eq('id', referralId)
                .select(`
         *, 
         referrer:users!referrer_id (id, name, email, telefone, cpf, unit_id, is_resolve_customer, energy_bill, unit:units(id, name)),
         referred_user:users!referred_user_id (id, name, email, cpf, telefone, unit_id, is_resolve_customer, energy_bill, unit:units(id, name))
       `)
                .single();

            if (error) throw error;

            const updatedReferrals = referrals.map((ref) => (ref.id === referralId ? data : ref));
            setReferrals(updatedReferrals);
            processStatistics(updatedReferrals);

            toast.success(`Status atualizado para: ${statusLabels[newStatus]}`);
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error('Error updating status: ' + (error.message || 'Unknown error'));
        }
    };

    const rejectReferral = async (reason: string) => {
        if (!currentReferralId) return;

        try {
            const { data, error } = await supabase
                .from('referrals')
                .update({
                    status: 'Sem Interesse ou Reprovado',
                    rejection_reason: reason
                })
                .eq('id', currentReferralId)
                .select(`
         *, 
         referrer:users!referrer_id (id, name, email, telefone, cpf, unit_id, is_resolve_customer, energy_bill, unit:units(id, name)),
         referred_user:users!referred_user_id (id, name, email, cpf, telefone, unit_id, is_resolve_customer, energy_bill, unit:units(id, name))
       `)
                .single();

            if (error) throw error;

            const updatedReferrals = referrals.map((ref) => (ref.id === currentReferralId ? data : ref));
            setReferrals(updatedReferrals);
            processStatistics(updatedReferrals);

            toast.success('Indicação marcada como Sem Interesse/Reprovada');
        } catch (error: any) {
            console.error('Error rejecting referral:', error);
            toast.error('Error rejecting referral: ' + (error.message || 'Unknown error'));
        } finally {
            setIsRejectionModalOpen(false);
            setCurrentReferralId(null);
        }
    };

    const exportToExcel = () => {
        try {
          import('xlsx').then(xlsx => {
            const exportData = filteredReferrals.map(ref => ({
              'Data': new Date(ref.created_at).toLocaleDateString(),
              'Status': statusLabels[ref.status] || ref.status,
              
              'Nome do Indicador': ref.referrer?.name || '—',
              'Email do Indicador': ref.referrer?.email || '—',
              'Telefone do Indicador': ref.referrer?.telefone || '—',
              'CPF do Indicador': ref.referrer?.cpf || '—',
              'Unidade do Indicador': ref.referrer?.unit?.name || '—',
              'Tipo de Indicador': ref.referrer?.is_resolve_customer ? 'Cliente' : 'Parceiro',
              
              'Nome do Indicado': ref.referred_user?.name || '—',
              'Email do Indicado': ref.referred_user?.email || '—',
              'Telefone do Indicado': ref.referred_user?.telefone || '—',
              'CPF do Indicado': ref.referred_user?.cpf || '—',
              'Unidade do Indicado': ref.referred_user?.unit?.name || '—',
              
              'Motivo da Rejeição': ref.rejection_reason || '—',
            }));
    
            const worksheet = xlsx.utils.json_to_sheet(exportData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Indicações");
    
            const fileName = `indicacoes_${new Date().toISOString().split('T')[0]}.xlsx`;
            xlsx.writeFile(workbook, fileName);
            
            toast.success('Exportação concluída com sucesso!');
          });
        } catch (error) {
          console.error('Error exporting to Excel:', error);
          toast.error('Erro ao exportar para Excel. Verifique se a biblioteca está instalada.');
        }
      };

      

    

    return {
        referrals: paginatedReferrals,
        allReferrals: filteredReferrals,
        units,
        isLoading,
        selectedUnit,
        setSelectedUnit,
        selectedStatus,
        setSelectedStatus,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        totalItems,
        unitChartData,
        statusData,
        userUnitId,
        isRejectionModalOpen,
        setIsRejectionModalOpen,
        canApproveReferrals,
        partnersRanking,
        clientsRanking,
        updateReferralStatus,
        rejectReferral,
        exportToExcel,
        allowedStatusForUser
    };
};

