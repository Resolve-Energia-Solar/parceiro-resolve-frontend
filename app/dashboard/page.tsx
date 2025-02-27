"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Ban, CheckCircle, Copy, Share2 } from "lucide-react";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { useDashboardData } from "../../hooks/useDashboardData";
import { Loader2 } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { RankingList } from "@/components/dashboard/RankingList";

export default function Dashboard() {
  const { data, loading } = useDashboardData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.referenceLink)
      .then(() => {
        alert("Link copiado com sucesso!");
      })
      .catch((err) => {
        alert("Erro ao copiar o link: " + err);
      });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Compartilhe seu link de indicação!",
        text: "Aqui está o meu link de indicação para você se juntar!",
        url: data.referenceLink,
      })
        .then(() => console.log("Link compartilhado com sucesso"))
        .catch((err) => alert("Erro ao compartilhar o link: " + err));
    } else {
      alert("A funcionalidade de compartilhamento não é suportada neste navegador.");
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      <Header />
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Acompanhe seu desempenho!</h2>
        <div className="bg-[#121212] p-4 rounded-lg mb-6">
          <p className="text-gray-400 text-sm mb-2">Copie seu link de indicação</p>
          <div className="flex gap-2">
            <input
              className="w-full p-2 rounded-lg bg-gray-800 text-gray-300"
              value={data.referenceLink}
              readOnly
            />
            <button
              className="bg-yellow-500 p-2 rounded-lg"
              onClick={copyToClipboard}
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              className="bg-gray-700 p-2 rounded-lg"
              onClick={shareLink}
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard icon={Users} value={data.referrals} label="Indicações" iconClassName="text-yellow-500" />
          <StatsCard icon={Clock} value={data.rewards} label="Em negociação" iconClassName="text-gray-400" />
          <StatsCard icon={Ban} value={data.disqualified} label="Desqualificados" iconClassName="text-red-500" />
          <StatsCard icon={CheckCircle} value={data.signedContracts} label="Contratos assinados" iconClassName="text-green-500" />
        </div>
      </div>
      <RankingList />
    </div>
  );
}
