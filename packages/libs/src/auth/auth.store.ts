"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { MeDto } from "./dto/login.dto";

type AuthState = {
  loggedIn: boolean | null;
  user: MeDto | null;
  setLogin: (loggedIn: boolean) => void;
  setUser: (user: MeDto | null) => void;
  setLogout: () => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    immer((set) => ({
      loggedIn: null,
      user: null,
      setLogin: (loggedIn) => set({ loggedIn }),
      setUser: (user) => set({ user }),
      setLogout: () => set({ loggedIn: false, user: null }),
    })),
    { name: "AuthStore" }
  )
);
