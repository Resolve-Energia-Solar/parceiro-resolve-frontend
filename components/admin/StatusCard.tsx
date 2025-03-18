import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatusCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export const StatusCard = ({ icon: Icon, label, value, color }: StatusCardProps) => (
  <Card style={{ backgroundColor: color }} className="shadow-lg">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-1 text-white opacity-90">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <Icon className="text-white opacity-75" size={40} />
      </div>
    </CardContent>
  </Card>
);
