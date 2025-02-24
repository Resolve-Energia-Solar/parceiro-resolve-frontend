"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Filter, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Referral {
  id: string;
  created_at: string;
  client: {
    name: string;
    document: string;
  };
  distributor: string;
  product_type: string;
  average_volume: string;
  status: string;
  status_details: string;
  commission: string;
}

// Mock data for testing
const mockReferrals: Referral[] = [
  {
    id: "1",
    created_at: "17/10/2024 22:19",
    client: {
      name: "Rita de cassia Barbosa de Almeida Macias",
      document: "260.592.152-20"
    },
    distributor: "EQUATORIAL PA",
    product_type: "GD",
    average_volume: "--",
    status: "Negociação",
    status_details: "Cliente Analisa...",
    commission: "--"
  },
  {
    id: "2",
    created_at: "17/10/2024 08:50",
    client: {
      name: "Matheus Barbosa de Almeida Macias",
      document: "--"
    },
    distributor: "EQUATORIAL PA",
    product_type: "GD",
    average_volume: "--",
    status: "Desqualificado",
    status_details: "Não atende a nã...",
    commission: "--"
  },
  {
    id: "3",
    created_at: "16/08/2024 14:51",
    client: {
      name: "Ana Cláudia Gomes da Silva",
      document: "--"
    },
    distributor: "EQUATORIAL PA",
    product_type: "GD",
    average_volume: "--",
    status: "Desqualificado",
    status_details: "Sem Contato Aut...",
    commission: "--"
  }
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'negociação':
      return 'bg-yellow-300 text-black';
    case 'desqualificado':
      return 'bg-black text-white';
    case 'assinado':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function ReferralTable() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [referrals, setReferrals] = useState(mockReferrals);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExportReport = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Exporting report...");
    } catch (error) {
      console.error("Error exporting report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedMonth("");
    setSelectedStatus("");
    setReferrals(mockReferrals);
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-lg" />
        <div className="h-96 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Filtros</h3>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="hover:bg-gray-100"
            >
              Limpar filtros
            </Button>
            <Button 
              variant="default"
              onClick={handleExportReport}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exportar relatório
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Período</p>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">Janeiro</SelectItem>
                <SelectItem value="02">Fevereiro</SelectItem>
                <SelectItem value="03">Março</SelectItem>
                <SelectItem value="04">Abril</SelectItem>
                <SelectItem value="05">Maio</SelectItem>
                <SelectItem value="06">Junho</SelectItem>
                <SelectItem value="07">Julho</SelectItem>
                <SelectItem value="08">Agosto</SelectItem>
                <SelectItem value="09">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Status</p>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="negotiating">Negociando</SelectItem>
                <SelectItem value="disqualified">Desqualificado</SelectItem>
                <SelectItem value="signed">Assinado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      <Card className="bg-white shadow-sm">
        <div className="rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-50">
                <TableHead>Criado em</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Distribuidora</TableHead>
                <TableHead>Tipo de produto</TableHead>
                <TableHead>Volume médio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detalhes Status</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead></TableHead>
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
                  <TableCell className="whitespace-nowrap">
                    {referral.created_at}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{referral.client.name}</p>
                      {referral.client.document !== "--" && (
                        <p className="text-sm text-gray-500">{referral.client.document}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {referral.distributor}
                  </TableCell>
                  <TableCell>
                    {referral.product_type}
                  </TableCell>
                  <TableCell>
                    {referral.average_volume}
                  </TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                      {referral.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="tooltip" title={referral.status_details}>
                      {referral.status_details}
                    </span>
                  </TableCell>
                  <TableCell>
                    {referral.commission}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M13 8L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
              {referrals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Nenhuma indicação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}