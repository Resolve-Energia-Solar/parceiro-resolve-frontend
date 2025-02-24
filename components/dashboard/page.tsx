"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Ban, CheckCircle } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { ReferralTable } from "../../components/dashboard/ReferralTable";
import { SalesLinkShare } from "../../components/dashboard/SalesLinkShare";
import { useUser } from "../../hooks/useUser";

export default function Dashboard() {
  const { user, loading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse w-full">
          <div className="h-16 bg-white border-b border-gray-100 w-full mb-8" />
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-white rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Meu desempenho</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            value="16"
            label="Total de indicados"
            iconClassName="text-red-500"
          />
          <StatsCard
            icon={Clock}
            value="08"
            label="Negociando"
            iconClassName="text-yellow-500"
          />
          <StatsCard
            icon={Ban}
            value="06"
            label="Desqualificados"
            iconClassName="text-red-500"
          />
          <StatsCard
            icon={CheckCircle}
            value="02"
            label="Contratos assinados"
            iconClassName="text-green-500"
          />
        </div>

        <SalesLinkShare />
        <ReferralTable />
      </div>
    </div>
  );
}