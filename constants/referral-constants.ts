import { LucideIcon, Users, PhoneCall, Clock, Ban, CheckCircle } from "lucide-react";

export const statusLabels = {
  'Indicação': 'Indicação',
  'Contato comercial': 'Contato Comercial',
  'Em negociação': 'Em negociação',
  'Sem Interesse ou Reprovado': 'Sem Interesse ou Reprovado',
  'Aprovado': 'Aprovado',
};

export const statusColors = {
  'Indicação': '#818CF8',
  'Contato comercial': '#FBBF24',
  'Em negociação': '#9333EA',
  'Sem Interesse ou Reprovado': '#F87171',
  'Aprovado': '#34D399',
};

export const statusIcons: Record<string, LucideIcon> = {
  'Indicação': Users,
  'Contato comercial': PhoneCall,
  'Em negociação': Clock,
  'Sem Interesse ou Reprovado': Ban,
  'Aprovado': CheckCircle,
};

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: 'Indicação' | 'Contato comercial' | 'Em negociação' | 'Sem Interesse ou Reprovado' | 'Aprovado';
  created_at: string;
  rejection_reason?: string;
  referrer: {
    energy_bill: string;
    id: string;
    name: string;
    email: string;
    cpf: string;
    telefone: string;
    unit_id: string;
    is_resolve_customer: boolean;
    unit: {
      id: string;
      name: string;
    }
  };
  referred_user: {
    id: string;
    cpf: string;
    telefone: string;
    name: string;
    email: string;
    unit_id: string;
    energy_bill: string;
    is_resolve_customer: boolean;
    unit: {
      id: string;
      name: string;
    }
  };
}

export interface Unit {
  id: string;
  name: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface StatusData {
  name: string;
  value: number;
  color: string;
}

export interface RankingData {
  id: string;
  name: string;
  email: string;
  telefone: string;
  total: number;
  approved: number;
  energy_bill: string;
  conversion: number;
  unit_name: string;
}
