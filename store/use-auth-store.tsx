// auth zustand store with persist
import { User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  user: User | null;
  setUser: (payload: User | null) => void;
  updateUser: (payload: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (data: User | null) => set({ user: data }),
      updateUser: (data: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return; // optionally throw or log warning here
        set({ user: { ...currentUser, ...data } });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
