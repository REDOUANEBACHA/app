import { create } from "zustand";
import { Round, UserStats } from "../types";
import * as api from "../services/api";

interface RoundState {
  rounds: Round[];
  stats: UserStats | null;
  loading: boolean;
  fetchRounds: (userId: string) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
}

export const useRoundStore = create<RoundState>((set) => ({
  rounds: [],
  stats: null,
  loading: false,

  fetchRounds: async (userId: string) => {
    set({ loading: true });
    try {
      const rounds = await api.getRounds(userId);
      set({ rounds, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchStats: async (userId: string) => {
    try {
      const stats = await api.getUserStats(userId);
      set({ stats });
    } catch {
      console.error("Failed to fetch stats");
    }
  },
}));
