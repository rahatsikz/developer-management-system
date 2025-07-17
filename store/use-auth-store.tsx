// auth zustand store with persist
import { User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  user: User | null;
  setUser: (payload: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (data: User | null) => set({ user: data }),
    }),
    {
      name: "auth-storage",
    }
  )
);
