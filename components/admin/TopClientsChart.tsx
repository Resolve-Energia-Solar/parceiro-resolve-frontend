import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RankingData } from "@/constants/referral-constants";
import { Users } from "lucide-react";

interface TopClientsChartProps {
  clientsRanking: RankingData[];
}

export const TopClientsChart = ({ clientsRanking }: TopClientsChartProps) => {
  return (
    <Card className="bg-gray-800 shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-green-400">Top 5 Clientes</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {clientsRanking.length > 0 ? (
          clientsRanking.slice(0, 5).map((item, index) => (
            <div key={item.id} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold mr-2
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-700'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm text-white">{item.name}</span>
                    <span className="text-xs text-gray-400 block">{item.unit_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-400">{item.total}</span>
                  <span className="text-xs text-green-400 block">{item.approved} aprovadas</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: `${(item.total / (clientsRanking[0]?.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Users className="mb-2 h-10 w-10 opacity-30" />
            <p className="text-center">Nenhum cliente com indicações encontrado</p>
            <p className="text-center text-sm mt-1">Os clientes são identificados pelo campo is_resolve_customer</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
