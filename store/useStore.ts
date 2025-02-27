import { create } from 'zustand';
import { User } from '../types';

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
  ranking: User[];
  setRanking: (ranking: User[]) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  ranking: [],
  setRanking: (ranking) => set({ ranking }),
}));
