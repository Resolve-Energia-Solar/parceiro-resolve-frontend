"use client";

import { useState } from 'react';
import { toast } from 'sonner';

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
}

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
    }
  }
];

export function useReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (referralId: string, newStatus: string) => {
    try {
      setUpdating(referralId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReferrals(current =>
        current.map(ref =>
          ref.id === referralId ? { ...ref, status: newStatus } : ref
        )
      );
      
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdating(null);
    }
  };

  return {
    referrals,
    loading,
    updating,
    updateStatus,
    refreshReferrals: () => {}
  };
}