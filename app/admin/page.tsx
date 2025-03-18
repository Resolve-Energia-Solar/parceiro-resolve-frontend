'use client';

import { useAuth } from "@/hooks/useAuth";
import { useReferrals } from "@/hooks/useReferrals";
import { StatusDashboard } from "@/components/admin/StatusDashboard";
import { StatisticsCards } from "@/components/admin/StatisticsCards";
import { RejectionModal } from "@/components/admin/RejectionModal";
import { ReferralsTable } from "@/components/admin/ReferralsTable";
import { RankingTable } from "@/components/admin/RankingTable";
import { TopUnitsChart } from "@/components/admin/TopUnitsChart";
import { TopPartnersChart } from "@/components/admin/TopPartnersChart";
import { TopClientsChart } from "@/components/admin/TopClientsChart";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReferralsDashboard() {
  const { user, userType } = useAuth();
  const {
    referrals,
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
    exportToExcel
  } = useReferrals({
    userId: user?.id,
    userType,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="h-10 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {Array(5).fill(null).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-gray-700" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            {Array(4).fill(null).map((_, i) => (
              <Skeleton key={i} className="h-40 bg-gray-700" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {Array(3).fill(null).map((_, i) => (
              <Skeleton key={i} className="h-64 bg-gray-700" />
            ))}
          </div>
          
          <Skeleton className="h-96 bg-gray-700 mb-8" />
          <Skeleton className="h-96 bg-gray-700" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard de Indicações</h1>
        
        <StatusDashboard statusData={statusData} />
        
        <StatisticsCards 
          partnersRanking={partnersRanking} 
          clientsRanking={clientsRanking} 
          unitChartData={unitChartData} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TopUnitsChart unitChartData={unitChartData} />
          <TopPartnersChart partnersRanking={partnersRanking} />
          <TopClientsChart clientsRanking={clientsRanking} />
        </div>
        
        <RankingTable 
          partnersRanking={partnersRanking} 
          clientsRanking={clientsRanking} 
        />
        
        <ReferralsTable
          referrals={referrals}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          units={units}
          selectedUnit={selectedUnit}
          selectedStatus={selectedStatus}
          searchTerm={searchTerm}
          userUnitId={userUnitId}
          userType={userType}
          canApproveReferrals={canApproveReferrals}
          onSearch={setSearchTerm}
          onUnitChange={setSelectedUnit}
          onStatusChange={setSelectedStatus}
          onPageChange={setCurrentPage}
          onStatusUpdate={updateReferralStatus}
          onExportToExcel={exportToExcel}
        />
        
        <RejectionModal
          isOpen={isRejectionModalOpen}
          onClose={() => setIsRejectionModalOpen(false)}
          onConfirm={rejectReferral}
        />
      </div>
    </AdminLayout>
  );
}