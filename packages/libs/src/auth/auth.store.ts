"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { MeDto } from "./dto/login.dto";
import { api } from "../share/api/apiClient";
import { immer } from "zustand/middleware/immer";

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
  setLogin: (is: boolean) => void;
  setCaptcha: (s: CaptchaState) => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    immer((set, get) => ({
      isLoggedIn: null,
      user: null,
      captcha: {
        status: CaptchaStatus.Unchecked,
      },
      setUser: (user) => set({ user }),
      setLogin: (isLoggedIn) => set({ isLoggedIn }),
      setLogout: () => {
        set({ user: null, isLoggedIn: null });
      },
      setCaptcha: (captcha) => set({ captcha }),
    })),
    { name: "UsersStore" }
  )
);
