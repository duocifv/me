"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SignInDto } from "./dto/sign-in.dto";
import { authService } from "./auth.service";
import { useAuthStore } from "./auth.store";
import { api } from "../share/api/apiClient";

export const loggedIn = () => api.storage.is();

export function useAuthLogoutQuery() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authService.getMe(),
    enabled: user === null,
    retry: false,
  });
}

export function useAuthLoginMutation() {
  return useMutation({
    mutationFn: (dto: SignInDto) => authService.login(dto),
  });
}

export function useAuthRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SignInDto) => authService.register(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["register"] });
    },
  });
}
export function useAuthLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    // onSuccess: async () => {
    //   await queryClient.cancelQueries();
    //   queryClient.removeQueries();
    //   queryClient.getQueryCache().clear();
    //   queryClient.getMutationCache().clear();
    // },
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
