"use client";

import { use, useEffect, useState } from "react";
import { Users, Clock, Ban, CheckCircle, Copy, Share2, UserPlus, PhoneCall, Check } from "lucide-react";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { useDashboardData, formatStatus } from "../../hooks/useDashboardData";
import { Loader2 } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { RankingList } from "@/components/dashboard/RankingList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReferralForm from "@/components/ReferralForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const { data, loading, error, refetch, updateWithNewReferral } = useDashboardData();
  const [mounted, setMounted] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [inputHighlighted, setInputHighlighted] = useState(false);
  const [newReferral, setNewReferral] = useState<any>(null);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);

  useEffect(() => {
    if (data?.recentReferrals) {
      setRecentReferrals(data.recentReferrals);
    }
  }, [data?.recentReferrals]);

  useEffect(() => {
    const checkAuth = async () => {
      setMounted(true);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Erro na sessão:", sessionError);
          toast.error("Erro ao verificar sua sessão");
          router.push("/onboarding");
          return;
        }

        if (!session || !session.user) {
          console.log("Nenhuma sessão encontrada");
          toast.error("Você precisa estar logado para acessar esta página");
          window.location.href = "/onboarding";
          return;
        }

        console.log("Usuário autenticado:", session.user);

        const userId = session.user.id;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error("Erro ao buscar dados do usuário:", userError);
          toast.error("Não foi possível verificar suas permissões");
          router.push("/");
          return;
        }

        if (!userData) {
          console.log("Usuário não encontrado na tabela users");
          toast.error("Perfil de usuário não encontrado");
          router.push("/");
          return;
        }

        console.log("Tipo de usuário:", userData.user_type);

        if (userData.user_type === 'Admin' || userData.user_type === 'Parceiro' || userData.user_type === 'SDR' || userData.user_type === 'Contratos' || userData.user_type === 'Super admin') {
          setIsAuthorized(true);
        } else {
          console.log("Usuário não autorizado:", userData.user_type);
          toast.error("Acesso não autorizado. Esta página é restrita para Administradores e Parceiros.");
          router.push("/");
          return;
        }

      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        toast.error("Ocorreu um erro ao verificar suas permissões");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (data?.referenceLink) {
      setReferralLink(data.referenceLink);
    }
  }, [data?.referenceLink]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        toast.success("Link copiado com sucesso!");

        setIsCopied(true);

        setInputHighlighted(true);

        setTimeout(() => {
          setIsCopied(false);
          setInputHighlighted(false);
        }, 30000);
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

  const handleReferralSuccess = (newReferralData: any) => {
    setIsModalOpen(false);
    
    if (newReferralData) {
      setNewReferral(newReferralData);
      
      const formattedReferral = {
        id: newReferralData.id,
        name: newReferralData.name,
        date: newReferralData.date,
        status: newReferralData.status
      };
      
      setRecentReferrals(prev => [formattedReferral, ...prev]);
      
      updateWithNewReferral(formattedReferral);
      
      refetch().catch(error => {
        console.error("Erro ao atualizar dados do servidor:", error);
      });
      
      setTimeout(() => {
        setNewReferral(null);
      }, 5000);
    }
  };

  if (!mounted || loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (error) {
    console.error("Erro ao carregar dashboard:", error);
    toast.error("Ocorreu um erro ao carregar os dados. Tente novamente.");
  }

  if (!isAuthorized) {
    return null;
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
            <ReferralForm onSuccess={handleReferralSuccess} referralCode={data?.referralCode} />
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatsCard
                icon={Users}
                value={data.indicacao}
                label="Indicações"
                iconClassName="text-blue-500"
              />
              <StatsCard
                icon={PhoneCall}
                value={data.contatoComercial}
                label="Contato Comercial"
                iconClassName="text-yellow-500"
              />
              <StatsCard
                icon={Clock}
                value={data.emNegociacao}
                label="Em Negociação"
                iconClassName="text-purple-500"
              />
              <StatsCard
                icon={Ban}
                value={data.semInteresse}
                label="Sem Interesse ou Reprovado"
                iconClassName="text-red-500"
              />
              <StatsCard
                icon={CheckCircle}
                value={data.aprovados}
                label="Aprovados"
                iconClassName="text-green-500"
              />
            </div>

            <div className="bg-[#121212] rounded-lg p-3 sm:p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Status das Indicações</h3>
              
              {newReferral && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-500/50 rounded-lg animate-pulse">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <p className="text-green-400">
                      Indicação de <span className="font-semibold">{newReferral.name}</span> criada com sucesso!
                    </p>
                  </div>
                </div>
              )}
              
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
                    {recentReferrals.length > 0 ? (
                      recentReferrals.map((referral) => (
                        <TableRow 
                          key={referral.id}
                          className={referral.id === newReferral?.id 
                            ? "bg-green-900/30 animate-pulse" 
                            : ""
                          }
                        >
                          <TableCell className="whitespace-nowrap">
                            {referral.id === newReferral?.id && (
                              <span className="inline-block mr-2 w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                            )}
                            {referral.name}
                            {referral.id === newReferral?.id && (
                              <span className="ml-2 text-xs text-green-400 font-medium">Nova</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{new Date(referral.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 inline-block text-center rounded-full text-xs ${referral.status === 'Indicação' ? 'bg-blue-500 text-white' :
                                referral.status === 'Contato comercial' ? 'bg-yellow-500 text-black' :
                                  referral.status === 'Em negociação' ? 'bg-purple-500 text-white' :
                                    referral.status === 'Sem Interesse ou Reprovado' ? 'bg-red-500 text-white' :
                                      referral.status === 'Aprovado' ? 'bg-green-500 text-white' :
                                        'bg-gray-500 text-white'
                                }`}
                            >
                              {formatStatus(referral.status)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                          Nenhuma indicação encontrada
                        </TableCell>
                      </TableRow>
                    )}
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
                  className={`w-full p-2 rounded-lg ${inputHighlighted
                    ? 'bg-green-900/30 text-white border border-green-500 transition-all duration-300'
                    : 'bg-gray-800 text-gray-300'} text-sm md:text-base`}
                  value={referralLink}
                  readOnly
                />
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button
                    className={`flex-1 sm:flex-none ${isCopied
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                      } p-2 rounded-lg transition-all duration-300`}
                    onClick={copyToClipboard}
                  >
                    {isCopied ? (
                      <div className="flex items-center">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                        <span className="text-xs">Copiado!</span>
                      </div>
                    ) : (
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                  <Button
                    className="flex-1 sm:flex-none bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                    onClick={shareLink}
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
              {isCopied && (
                <div className="mt-2 text-green-400 text-sm flex items-center animate-pulse">
                  <Check className="w-4 h-4 mr-1" />
                  Link copiado para a área de transferência!
                </div>
              )}
            </div>
            <div className="bg-[#121212] rounded-lg p-3 sm:p-4 md:p-6">
              <RankingList />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] rounded-lg p-3 sm:p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Informações sobre Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {[
              { icon: Users, color: "text-blue-500", label: "Indicação: Cliente indicado" },
              { icon: PhoneCall, color: "text-yellow-500", label: "Contato Comercial: Em contato" },
              { icon: Clock, color: "text-purple-500", label: "Em Negociação: Proposta em análise" },
              { icon: Ban, color: "text-red-500", label: "Sem Interesse ou Reprovado: Cliente recusou" },
              { icon: CheckCircle, color: "text-green-500", label: "Aprovado: Negócio fechado" },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <item.icon className={`${item.color} w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0`} />
                <span className="text-sm md:text-base">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
