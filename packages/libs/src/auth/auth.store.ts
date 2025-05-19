"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { MeDto } from "./dto/login.dto";
import { api } from "../share/api/apiClient";
import { immer } from "zustand/middleware/immer";

type AuthState = {
  isLoggedIn: boolean | null;
  user: MeDto | null;
  setUser: (user: MeDto | null) => void;
  setLogout: () => void;
  setLogin: (is: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    immer((set, get) => ({
      isLoggedIn: null,
      user: null,
      setUser: (user) => set({ user }),
      setLogin: (isLoggedIn) => set({ isLoggedIn }),
      setLogout: () => {
        api.redirectLogin();
        set({ user: null, isLoggedIn: null });
      },
    })),
    { name: "UsersStore" }
  )
);
