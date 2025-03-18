'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RankingData } from "@/constants/referral-constants";
import { formatPhoneNumber } from "@/utils/formatter";

interface RankingTableProps {
  partnersRanking: RankingData[];
  clientsRanking: RankingData[];
}

export const RankingTable = ({ partnersRanking, clientsRanking }: RankingTableProps) => {
  const [rankingType, setRankingType] = useState<'partners' | 'clients'>('partners');

  return (
    <>
      <div className="lg:hidden space-y-4 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-indigo-400">
            Top 5 {rankingType === 'partners' ? 'Parceiros' : 'Clientes'}
          </h2>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={rankingType === 'partners' ? "default" : "outline"}
              onClick={() => setRankingType('partners')}
              className={rankingType === 'partners'
                ? "bg-indigo-600 hover:bg-indigo-700 text-sm py-1"
                : "border-gray-600 text-gray-300 hover:bg-gray-700 text-sm py-1"}
            >
              Parceiros
            </Button>
            <Button
              size="sm"
              variant={rankingType === 'clients' ? "default" : "outline"}
              onClick={() => setRankingType('clients')}
              className={rankingType === 'clients'
                ? "bg-purple-600 hover:bg-purple-700 text-sm py-1"
                : "border-gray-600 text-gray-300 hover:bg-gray-700 text-sm py-1"}
            >
              Clientes
            </Button>
          </div>
        </div>

        {(rankingType === 'partners' ? partnersRanking : clientsRanking).length > 0 ? (
          (rankingType === 'partners' ? partnersRanking : clientsRanking).slice(0, 5).map((item, index) => (
            <Card key={item.id} className="bg-gray-800 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-700'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-gray-400">{item.unit_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-indigo-400">{item.total} <span className="text-xs font-normal">indicações</span></div>
                    <div className="text-sm text-green-400">{item.approved} <span className="text-xs font-normal">aprovadas</span></div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full"
                      style={{ width: `${item.conversion}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">Conversão</span>
                    <span className="text-xs text-indigo-300">{item.conversion.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-800 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="h-10 w-10 text-gray-500 mx-auto mb-3">👤</div>
              <p className="text-gray-400">
                Nenhum {rankingType === 'partners' ? 'parceiro' : 'cliente'} encontrado
              </p>
              {rankingType === 'clients' && (
                <p className="text-gray-500 text-sm mt-2">
                  Os clientes são identificados pelo campo is_resolve_customer
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop view */}
      <Card className="bg-gray-800 shadow-lg overflow-hidden mb-8 hidden lg:block">
        <CardHeader className="border-b border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-indigo-400">
              Ranking de {rankingType === 'partners' ? 'Parceiros' : 'Clientes'} por Indicações
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={rankingType === 'partners' ? "default" : "outline"}
                onClick={() => setRankingType('partners')}
                className={rankingType === 'partners'
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"}
              >
                Parceiros
              </Button>
              <Button
                variant={rankingType === 'clients' ? "default" : "outline"}
                onClick={() => setRankingType('clients')}
                className={rankingType === 'clients'
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"}
              >
                Clientes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {rankingType === 'partners' ? 'Parceiro' : 'Cliente'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contato
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total de {rankingType === 'partners' ? 'Indicações' : 'Contatos'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Aprovados
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Taxa de Conversão
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {(rankingType === 'partners' ? partnersRanking : clientsRanking).length > 0 ? (
                  (rankingType === 'partners' ? partnersRanking : clientsRanking).slice(0, 15).map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-850' : 'bg-gray-800'}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                        <div className={`
                          w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm
                          ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-700'}
                        `}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-100">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">{item.email}</div>
                        <div className="text-sm text-gray-400">{formatPhoneNumber(item.telefone)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">{item.unit_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-900 text-indigo-300">
                          {item.total}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                          {item.approved}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
                          <div
                            className="bg-indigo-500 h-2.5 rounded-full"
                            style={{ width: `${item.conversion}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-300">{item.conversion.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      Nenhum {rankingType === 'partners' ? 'parceiro' : 'cliente'} encontrado com os filtros atuais.
                      {rankingType === 'clients' && (
                        <p className="text-sm mt-2">Os clientes são identificados pelo campo is_resolve_customer = true</p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
