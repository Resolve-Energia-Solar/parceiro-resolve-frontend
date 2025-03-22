import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Referral, Unit } from "@/constants/referral-constants";
import { formatPhoneNumber, formatCPF } from "@/utils/formatter";
import { statusColors, statusLabels } from "@/constants/referral-constants";
import { Download } from "lucide-react";

interface ReferralsTableProps {
  referrals: Referral[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  units: Unit[];
  selectedUnit: string;
  selectedStatus: string;
  searchTerm: string;
  userUnitId: string | null;
  userType: string | undefined;
  canApproveReferrals: boolean;
  allowedStatusForUser: string[];
  onSearch: (term: string) => void;
  onUnitChange: (unit: string) => void;
  onStatusChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onStatusUpdate: (referralId: string, newStatus: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem Interesse ou Reprovado' | 'Aprovado') => void;
  onExportToExcel: () => void;

}

export const ReferralsTable = ({
  referrals,
  currentPage,
  itemsPerPage,
  totalItems,
  units,
  selectedUnit,
  selectedStatus,
  searchTerm,
  userType,
  canApproveReferrals,
  onSearch,
  onUnitChange,
  onStatusChange,
  onPageChange,
  onStatusUpdate,
  onExportToExcel,
  allowedStatusForUser
}: ReferralsTableProps) => {

  
  return (
    <Card className="bg-gray-800 shadow-lg overflow-hidden mb-8">
      <CardHeader className="border-b border-gray-700 pb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-semibold text-indigo-400">Indicações</CardTitle>
            <Button
              onClick={onExportToExcel}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Download size={16} />
              <span>Exportar Excel</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full lg:w-auto">
            <Input
              placeholder="Buscar por nome"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full sm:w-64 bg-gray-700 text-gray-100 border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              {(userType === 'Admin' || userType === 'Super admin' || userType === "Contratos") && (
                <Select value={selectedUnit} onValueChange={onUnitChange}>
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
              <Select value={selectedStatus} onValueChange={onStatusChange}>
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
        </div>
      </CardHeader>
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
                Fatura
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
            {referrals.length > 0 ? (
              referrals.map((referral) => (            
                <tr key={referral.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-100">{referral.referrer?.name || "—"}</div>
                    <div className="text-sm text-gray-400">{referral.referrer?.email || "—"}</div>
                    <div className="text-sm text-gray-400">{formatPhoneNumber(referral.referrer?.telefone) || "—"}</div>
                    <div className="text-sm text-gray-400">{formatCPF(referral.referrer?.cpf) || "—"}</div>
                    {referral.referrer?.is_resolve_customer && (
                      <div className="mt-1 inline-block px-2 py-0.5 text-xs bg-blue-900 text-blue-300 rounded-full">
                        Cliente Resolve
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="">
                      <div className="text-sm font-medium text-gray-100">{referral.referred_user?.name || "—"}</div>
                      <div className="text-sm text-gray-400">{referral.referred_user?.email || "—"}</div>
                      <div className="text-sm text-gray-400">{formatPhoneNumber(referral.referred_user?.telefone) || "—"}</div>
                      {referral.referred_user?.is_resolve_customer && (
                        <div className="mt-1 inline-block px-2 py-0.5 text-xs bg-blue-900 text-blue-300 rounded-full">
                          Cliente Resolve
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-400">
                      {referral.referred_user?.energy_bill ? `${referral.referred_user.energy_bill}` : "—"}
                    </div>
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
                        onValueChange={(value) => onStatusUpdate(referral.id, value as any)}
                      >
                        <SelectTrigger
                          className="w-[140px]"
                          style={{
                            backgroundColor: "rgba(31, 41, 55, 0.8)",
                            borderColor: statusColors[referral.status] || '#6B7280',
                            borderWidth: "1.5px"
                          }}
                        >
                          <SelectValue placeholder="Alterar status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem
                            value="Indicação"
                            className="hover:bg-gray-600 text-white"
                            disabled={!Array.isArray(allowedStatusForUser) || !allowedStatusForUser.includes("Indicação") || referral.status === "Indicação"}
                          >
                            
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Indicação'] }}></span>
                              Indicação
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="Contato comercial"
                            className="hover:bg-gray-600 text-white"
                            disabled={!Array.isArray(allowedStatusForUser) || !allowedStatusForUser.includes("Contato comercial") || referral.status === "Contato comercial"}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Contato comercial'] }}></span>
                              Contato comercial
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="Em negociação"
                            className="hover:bg-gray-600 text-white"
                            disabled={!Array.isArray(allowedStatusForUser) || !allowedStatusForUser.includes("Em negociação") || referral.status === "Em negociação"}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Em negociação'] }}></span>
                              Em negociação
                            </div>
                          </SelectItem>
                          <SelectItem
                          
                            value="Sem Interesse ou Reprovado"
                            className="hover:bg-gray-600 text-white"
                            disabled={!Array.isArray(allowedStatusForUser) || !allowedStatusForUser.includes("Sem Interesse ou Reprovado") || referral.status === "Sem Interesse ou Reprovado"}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Sem Interesse ou Reprovado'] }}></span>
                              Sem Interesse ou Reprovado
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="Aprovado"
                            className="hover:bg-gray-600 text-white"
                            disabled={!Array.isArray(allowedStatusForUser) || !allowedStatusForUser.includes("Aprovado") || referral.status === "Aprovado"}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors['Aprovado'] }}></span>
                              Aprovado {!canApproveReferrals && '(Requer permissão)'}
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

      {totalItems > 0 && (
        <div className="bg-gray-800 p-4 border-t border-gray-700 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">
              Mostrando <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md gap-3 shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:opacity-50"
              >
                Anterior
              </Button>
              <Button
                onClick={() => onPageChange(
                  currentPage < Math.ceil(totalItems / itemsPerPage) ? currentPage + 1 : currentPage
                )}
                disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                className="relative inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:opacity-50"
              >
                Próximo
              </Button>
            </nav>
          </div>
        </div>
      )}
    </Card>
  );
};
