"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";

import { MeDto } from "./dto/login.dto";
import { api } from "../share/api/apiClient";

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
        setLogout: () => {
          set({ loggedIn: false, user: null });
          api.clearToken();
          api.redirectLogin();
        },
        setHydrated: (v) => set({ hydrated: v }),
      }),
      {
        name: "auth-store",
        skipHydration: true,
        partialize: (state) => ({
          loggedIn: state.loggedIn,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHydrated(true);
          }
        },
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "AuthStore" }
  )
);
