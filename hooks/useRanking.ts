"use client";

import { useState } from 'react';

interface RankingUser {
  id: string;
  name: string;
  referral_count: number;
  rank: number;
}

const mockRankings: RankingUser[] = [
  { id: "1", name: "João Silva", referral_count: 45, rank: 1 },
  { id: "2", name: "Maria Santos", referral_count: 38, rank: 2 },
  { id: "3", name: "Pedro Oliveira", referral_count: 32, rank: 3 },
  { id: "4", name: "Ana Costa", referral_count: 28, rank: 4 },
  { id: "5", name: "Lucas Pereira", referral_count: 25, rank: 5 }
];

export function useRanking() {
  const [rankings] = useState<RankingUser[]>(mockRankings);
  const [loading] = useState(false);

  return { rankings, loading, refreshRankings: () => {} };
}