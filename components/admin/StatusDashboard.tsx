import { StatusCard } from "./StatusCard";
import { StatusData } from "@/constants/referral-constants";
import { statusColors, statusIcons } from "@/constants/referral-constants";

interface StatusDashboardProps {
  statusData: StatusData[];
}

export const StatusDashboard = ({ statusData }: StatusDashboardProps) => {
  const getStatusValue = (statusName: string): number => {
    const status = statusData.find(s => s.name === statusName);
    return status?.value || 0;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <StatusCard 
        icon={statusIcons['Indicação']} 
        label="Indicação" 
        value={getStatusValue('Indicação')} 
        color={statusColors['Indicação']} 
      />
      <StatusCard 
        icon={statusIcons['Contato comercial']} 
        label="Contato Comercial" 
        value={getStatusValue('Contato Comercial')} 
        color={statusColors['Contato comercial']} 
      />
      <StatusCard 
        icon={statusIcons['Em negociação']} 
        label="Em negociação" 
        value={getStatusValue('Em negociação')} 
        color={statusColors['Em negociação']} 
      />
      <StatusCard 
        icon={statusIcons['Sem Interesse ou Reprovado']} 
        label="Sem Interesse ou Reprovado" 
        value={getStatusValue('Sem Interesse ou Reprovado')} 
        color={statusColors['Sem Interesse ou Reprovado']} 
      />
      <StatusCard 
        icon={statusIcons['Aprovado']} 
        label="Aprovado" 
        value={getStatusValue('Aprovado')} 
        color={statusColors['Aprovado']} 
      />
    </div>
  );
};
