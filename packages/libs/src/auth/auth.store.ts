"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";

import { MeDto } from "./dto/login.dto";

type AuthState = {
  loggedIn: boolean | null;
  user: MeDto | null;
  hydrated: boolean;
  setLogin: (loggedIn: boolean | null) => void;
  setUser: (user: MeDto | null) => void;
  setLogout: () => void;
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        loggedIn: null,
        user: null,
        hydrated: false,
        setLogin: (loggedIn) => set({ loggedIn }),
        setUser: (user) => set({ user }),
        setLogout: () => set({ loggedIn: false, user: null }),
        setHydrated: (v) => set({ hydrated: v }),
      }),
      {
        name: "auth-store",
        partialize: (state) => ({ loggedIn: state.loggedIn }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated(true);
        },
      }
    ),
    { name: "AuthStore" }
  )
);
