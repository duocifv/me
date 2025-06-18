"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SignInDto } from "./dto/sign-in.dto";
import { authService } from "./auth.service";
import { CaptchaStatus, useAuthStore } from "./auth.store";
import { api } from "../share/api/apiClient";
import { ResetPasswordTokenDto } from "./dto/reset-password";
import { RegisterDto } from "./dto/register.dto";

export const loggedIn = () => api.storage.is();

export function useAuthProfileQuery() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: ["me"],
    queryFn: () => authService.getMe(),
    enabled: isLoggedIn === true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useAuthLoginMutation() {
  const setCaptcha = useAuthStore((s) => s.setCaptcha);
  return useMutation({
    mutationFn: (dto: SignInDto) => authService.login(dto),
    onError: (error) => {
      if (error.name === "CaptchaRequired") {
        setCaptcha({
          status: CaptchaStatus.Failed,
        });
      }
    },
  });
}

export function useAuthRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegisterDto) => authService.register(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["register"] });
    },
  });
}
export function useAuthLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.removeQueries();
      queryClient.getQueryCache().clear();
      queryClient.getMutationCache().clear();
    },
  });
}

export function useAuthChangePasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SignInDto) => authService.changePassword(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["register"] });
    },
  });
}

export function useAuthResetPasswordMutation() {
  return useMutation({
    mutationFn: (dto: ResetPasswordTokenDto) => authService.resetPassword(dto),
  });
}

export function useAuthVerifyEmailMutation() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}
