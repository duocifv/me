"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SignInDto } from "./dto/sign-in.dto";
import { authService } from "./auth.service";
import { useAuthStore } from "./auth.store";

export function useAuthLoginMutation() {
  return useMutation({
    mutationFn: (dto: SignInDto) => authService.login(dto),
    onSuccess: () => {
      useAuthStore.setState({ loggedIn: true });
    },
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
  const setLogout = useAuthStore((s) => s.setLogout);
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.removeQueries();
      queryClient.getQueryCache().clear();
      queryClient.getMutationCache().clear();
      setLogout();
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
