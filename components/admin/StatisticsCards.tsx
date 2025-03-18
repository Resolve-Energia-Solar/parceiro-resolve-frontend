import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Trophy } from "lucide-react";
import { ChartData, RankingData } from "@/constants/referral-constants";

interface StatisticsCardsProps {
  partnersRanking: RankingData[];
  clientsRanking: RankingData[];
  unitChartData: ChartData[];
}

export const StatisticsCards = ({ partnersRanking, clientsRanking, unitChartData }: StatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-indigo-900 to-blue-800 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            Top Parceiro
          </h3>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-indigo-300" />
            <p className="text-2xl font-bold text-white">
              {partnersRanking.length > 0 ? partnersRanking[0].name : '—'}
            </p>
          </div>
          <p className="mt-2 text-sm text-indigo-200">
            {partnersRanking.length > 0 ? `${partnersRanking[0].total} indicações totais` : 'Sem dados'}
          </p>
          <p className="mt-1 text-sm text-indigo-200">
            {partnersRanking.length > 0 ? `${partnersRanking[0].approved} aprovadas (${partnersRanking[0].conversion.toFixed(1)}%)` : ''}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-900 to-pink-800 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            Top Cliente
          </h3>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-purple-300" />
            <p className="text-2xl font-bold text-white">
              {clientsRanking.length > 0 ? clientsRanking[0].name : '—'}
            </p>
          </div>
          <p className="mt-2 text-sm text-purple-200">
            {clientsRanking.length > 0 ? `${clientsRanking[0].unit_name}` : 'Sem dados'}
          </p>
          <p className="mt-1 text-sm text-purple-200">
            {clientsRanking.length > 0 ? `${clientsRanking[0].approved} indicações aprovadas` : ''}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-900 to-emerald-800 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            Unidade Destaque
          </h3>
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-green-300" />
            <p className="text-2xl font-bold text-white">
              {unitChartData.length > 0 ? unitChartData[0].name : '—'}
            </p>
          </div>
          <p className="mt-2 text-sm text-green-200">
            {unitChartData.length > 0
              ? `${unitChartData[0].value} indicações registradas`
              : 'Sem dados'}
          </p>
          <p className="mt-1 text-sm text-green-200">
            {unitChartData.length > 1
              ? `2º lugar: ${unitChartData[1].name} (${unitChartData[1].value})`
              : ''}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-900 to-orange-800 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            Melhores Conversões
          </h3>
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-amber-300" />
            <p className="text-2xl font-bold text-white">
              {partnersRanking.filter(p => p.total >= 3).length > 0
                ? partnersRanking.filter(p => p.total >= 3).sort((a, b) => b.conversion - a.conversion)[0].conversion.toFixed(1) + '%'
                : '—'}
            </p>
          </div>
          <p className="mt-2 text-sm text-amber-200">
            {partnersRanking.filter(p => p.total >= 3).length > 0
              ? `${partnersRanking.filter(p => p.total >= 3).sort((a, b) => b.conversion - a.conversion)[0].name}`
              : 'Mínimo de 3 indicações'}
          </p>
          <p className="mt-1 text-sm text-amber-200">
            {partnersRanking.filter(p => p.total >= 3).length > 1
              ? `2º lugar: ${partnersRanking.filter(p => p.total >= 3).sort((a, b) => b.conversion - a.conversion)[1].name} (${partnersRanking.filter(p => p.total >= 3).sort((a, b) => b.conversion - a.conversion)[1].conversion.toFixed(1)}%)`
              : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
