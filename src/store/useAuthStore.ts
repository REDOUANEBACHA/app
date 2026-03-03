import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import * as api from "../services/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, name: string) => Promise<void>;
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email: string, name: string) => {
    try {
      let user: User;
      try {
        user = await api.getUserByEmail(email);
      } catch {
        user = await api.createUser({ name, email });
      }
      await AsyncStorage.setItem("userId", user.id);
      set({ user });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  loadUser: async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const user = await api.getUser(userId);
        set({ user, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("userId");
    set({ user: null });
  },
}));
