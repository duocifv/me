"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SignInDto } from "./dto/sign-in.dto";
import { authService } from "./auth.service";
import { useAuthStore } from "./auth.store";

export function useAuth() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: (dto: SignInDto) => authService.login(dto),
    onSuccess: () => {
      useAuthStore.setState({ loggedIn: true });
    },
  });

  const register = useMutation({
    mutationFn: (dto: SignInDto) => authService.register(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["register"] });
    },
  });

  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      useAuthStore.setState({ loggedIn: false, user: null });
    },
  });

  const changePassword = useMutation({
    mutationFn: (dto: SignInDto) => authService.changePassword(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["register"] });
    },
  });

  return {
    login,
    register,
    logout,
    changePassword,
    // state accessors (không dùng cho UI reactivity)
    // getLogin: () => useAuthStore.getState().loggedIn,
    // getUser: () => useAuthStore.getState().user,
  };
}
