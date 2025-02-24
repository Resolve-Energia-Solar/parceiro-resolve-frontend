"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck, UserX, Users2, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Referral {
  id: string;
  status: string;
  created_at: string;
  referrer: {
    name: string;
    email: string;
    cpf: string;
  };
  referred: {
    name: string;
    email: string;
    cpf: string;
  };
  sale_value?: number;
  commission_value?: number;
  contract_number?: string;
  notes?: string;
}

// Mock data for testing
const mockReferrals: Referral[] = [
  {
    id: "1",
    status: "pending",
    created_at: new Date().toISOString(),
    referrer: {
      name: "João Silva",
      email: "joao@example.com",
      cpf: "123.456.789-00"
    },
    referred: {
      name: "Maria Santos",
      email: "maria@example.com",
      cpf: "987.654.321-00"
    }
  },
  {
    id: "2",
    status: "approved",
    created_at: new Date().toISOString(),
    referrer: {
      name: "Pedro Oliveira",
      email: "pedro@example.com",
      cpf: "111.222.333-44"
    },
    referred: {
      name: "Ana Costa",
      email: "ana@example.com",
      cpf: "555.666.777-88"
    },
    sale_value: 15000,
    commission_value: 750,
    contract_number: "2024-0001"
  }
];

export function AdminReferralList() {
  const [referrals] = useState<Referral[]>(mockReferrals);
  const [loading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [saleDetails, setSaleDetails] = useState({
    sale_value: "",
    commission_value: "",
    contract_number: "",
    notes: ""
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-[1400px] mx-auto px-6">
        <Card className="bg-white shadow-md animate-pulse">
          <div className="p-6 border-b">
            <div className="h-8 w-64 bg-gray-200 rounded" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const updateStatus = async (referralId: string, newStatus: string) => {
    try {
      setUpdating(referralId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdating(null);
    }
  };

  const handleValidateSale = async (referralId: string) => {
    try {
      setUpdating(referralId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the sale details to your backend
      console.log('Sale details:', {
        referralId,
        ...saleDetails
      });
      
      toast.success("Venda validada com sucesso!");
      setSaleDetails({
        sale_value: "",
        commission_value: "",
        contract_number: "",
        notes: ""
      });
    } catch (error) {
      console.error('Erro ao validar venda:', error);
      toast.error("Erro ao validar venda");
    } finally {
      setUpdating(null);
      setSelectedReferral(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'negotiating':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <UserCheck className="w-4 h-4" />;
      case 'rejected':
        return <UserX className="w-4 h-4" />;
      case 'negotiating':
        return <Users2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white shadow-md">
          <motion.div 
            className="p-6 border-b"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Administração de Indicações</h1>
              <Button
                variant="outline"
                disabled={loading}
                className="hover:bg-gray-100"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Atualizar"
                )}
              </Button>
            </div>
          </motion.div>

          <div className="p-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Indicador</TableHead>
                    <TableHead>Indicado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor da Venda</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral, index) => (
                    <motion.tr
                      key={referral.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{referral.referrer.name}</p>
                          <p className="text-sm text-gray-500">{referral.referrer.email}</p>
                          <p className="text-sm text-gray-500">CPF: {referral.referrer.cpf}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{referral.referred.name}</p>
                          <p className="text-sm text-gray-500">{referral.referred.email}</p>
                          <p className="text-sm text-gray-500">CPF: {referral.referred.cpf}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                          {getStatusIcon(referral.status)}
                          <span className="ml-1 capitalize">{referral.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {referral.sale_value ? formatCurrency(referral.sale_value) : '--'}
                      </TableCell>
                      <TableCell>
                        {referral.commission_value ? formatCurrency(referral.commission_value) : '--'}
                      </TableCell>
                      <TableCell>
                        {referral.contract_number || '--'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Select
                            disabled={updating === referral.id}
                            onValueChange={(value) => updateStatus(referral.id, value)}
                            defaultValue={referral.status}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="negotiating">Negociando</SelectItem>
                              <SelectItem value="approved">Aprovado</SelectItem>
                              <SelectItem value="rejected">Rejeitado</SelectItem>
                            </SelectContent>
                          </Select>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => setSelectedReferral(referral)}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Validar Venda</DialogTitle>
                                <DialogDescription>
                                  Preencha os detalhes da venda para validar a indicação.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="sale_value" className="text-right">
                                    Valor da Venda
                                  </Label>
                                  <Input
                                    id="sale_value"
                                    type="number"
                                    className="col-span-3"
                                    value={saleDetails.sale_value}
                                    onChange={(e) => setSaleDetails(prev => ({
                                      ...prev,
                                      sale_value: e.target.value
                                    }))}
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="commission_value" className="text-right">
                                    Valor da Comissão
                                  </Label>
                                  <Input
                                    id="commission_value"
                                    type="number"
                                    className="col-span-3"
                                    value={saleDetails.commission_value}
                                    onChange={(e) => setSaleDetails(prev => ({
                                      ...prev,
                                      commission_value: e.target.value
                                    }))}
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="contract_number" className="text-right">
                                    Número do Contrato
                                  </Label>
                                  <Input
                                    id="contract_number"
                                    className="col-span-3"
                                    value={saleDetails.contract_number}
                                    onChange={(e) => setSaleDetails(prev => ({
                                      ...prev,
                                      contract_number: e.target.value
                                    }))}
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="notes" className="text-right">
                                    Observações
                                  </Label>
                                  <Input
                                    id="notes"
                                    className="col-span-3"
                                    value={saleDetails.notes}
                                    onChange={(e) => setSaleDetails(prev => ({
                                      ...prev,
                                      notes: e.target.value
                                    }))}
                                  />
                                </div>
                              </div>

                              <DialogFooter>
                                <Button
                                  type="submit"
                                  onClick={() => selectedReferral && handleValidateSale(selectedReferral.id)}
                                  disabled={updating === selectedReferral?.id}
                                >
                                  {updating === selectedReferral?.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    "Validar Venda"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {referrals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Nenhuma indicação encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}