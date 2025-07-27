"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { MeDto } from "./dto/login.dto";
import { api } from "../share/api/apiClient";

export enum CaptchaStatus {
  Unchecked,
  Failed,
  Success,
}

export type CaptchaState = {
  status: CaptchaStatus;
  token?: string;
};

type AuthState = {
  isLoggedIn: boolean | null;
  user: MeDto | null;
  captcha: CaptchaState;
  setUser: (user: MeDto | null) => void;
  setLogout: () => void;
  setLogin: () => void;
  setCaptcha: (s: CaptchaState) => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    immer((set) => ({
      isLoggedIn: null,
      user: null,
      captcha: {
        status: CaptchaStatus.Unchecked,
      },
      setUser: (user) => set({ user }),
      setLogin: () => {
        set({ isLoggedIn: true });
      },
      setLogout: () => {
        api.storage.logout();
        set({ isLoggedIn: false, user: null });
      },
      setCaptcha: (captcha) => set({ captcha }),
    })),
    { name: "UsersStore" }
  )
);
