import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartData } from "@/constants/referral-constants";

interface TopUnitsChartProps {
  unitChartData: ChartData[];
}

export const TopUnitsChart = ({ unitChartData }: TopUnitsChartProps) => {
  return (
    <Card className="bg-gray-800 shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-indigo-400">Top 5 Unidades</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {unitChartData.slice(0, 5).map((item, index) => (
          <div key={item.name} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold mr-2
                  ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-700'}
                `}>
                  {index + 1}
                </div>
                <span className="text-sm text-white">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-indigo-400">{item.value}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{ width: `${(item.value / unitChartData[0].value) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
