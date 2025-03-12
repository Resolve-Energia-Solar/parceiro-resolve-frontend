"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Ban, CheckCircle, Copy, Share2, UserPlus } from "lucide-react";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { useDashboardData } from "../../hooks/useDashboardData";
import { Loader2 } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { RankingList } from "@/components/dashboard/RankingList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReferralForm from "@/components/ReferralForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function Dashboard() {
  const { data, loading } = useDashboardData();
  const [mounted, setMounted] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (data?.referenceLink) {
      setReferralLink(data.referenceLink);
    }
  }, [data?.referenceLink]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        toast.success("Link copiado com sucesso!");
      })
      .catch((err) => {
        toast.error("Erro ao copiar o link: " + err);
      });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Indique e Ganhe - Resolve Energia Solar",
        text: "Instale energia solar e ganhe recompensas por indicações!",
        url: referralLink,
      })
        .then(() => toast.success("Link compartilhado com sucesso"))
        .catch((err) => toast.error("Erro ao compartilhar o link: " + err));
    } else {
      toast.error("A funcionalidade de compartilhamento não é suportada neste navegador.");
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
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Seu Desempenho</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-yellow-500 text-black hover:bg-yellow-600 transition-colors"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Nova Indicação
          </Button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-[#121212] text-white max-w-[95vw] sm:max-w-[500px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Nova Indicação</DialogTitle>
            </DialogHeader>
            <ReferralForm onSuccess={() => setIsModalOpen(false)} referralCode={data?.referralCode} />
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <StatsCard
                icon={Users}
                value={data.referrals}
                label="Indicações"
                iconClassName="text-yellow-500"
              />
              <StatsCard
                icon={Clock}
                value={data.pending}
                label="Em análise"
                iconClassName="text-blue-500"
              />
              <StatsCard
                icon={Ban}
                value={data.rejected}
                label="Rejeitados"
                iconClassName="text-red-500"
              />
              <StatsCard
                icon={CheckCircle}
                value={data.approved}
                label="Aprovados"
                iconClassName="text-green-500"
              />
            </div>
            <div className="bg-[#121212] rounded-lg p-3 sm:p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Status das Indicações</h3>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Nome</TableHead>
                      <TableHead className="whitespace-nowrap">Data</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentReferrals?.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="whitespace-nowrap">{referral.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(referral.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 inline-block text-center rounded-full text-xs ${
                            referral.status === 'approved' ? 'bg-green-500' :
                            referral.status === 'rejected' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}>
                            {referral.status === 'pending' ? 'Em análise' :
                            referral.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <div className="space-y-4 md:space-y-6">
            <div className="bg-[#121212] p-3 sm:p-4 md:p-4 rounded-lg">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Seu Link de Indicação</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="w-full p-2 rounded-lg bg-gray-800 text-gray-300 text-sm md:text-base"
                  value={referralLink}
                  readOnly
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1 sm:flex-auto bg-yellow-500 p-2 rounded-lg hover:bg-yellow-600 transition-colors"
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button
                    className="flex-1 sm:flex-auto bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                    onClick={shareLink}
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-[#121212] rounded-lg p-3 sm:p-4 md:p-6">
              <RankingList />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] rounded-lg p-3 sm:p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Informações sobre Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm md:text-base">Em análise: Indicação está sendo avaliada</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm md:text-base">Aprovado: Indicação aceita e recompensa garantida</span>
            </div>
            <div className="flex items-center space-x-2">
              <Ban className="text-red-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm md:text-base">Rejeitado: Indicação não atendeu aos critérios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
