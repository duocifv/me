"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SignInDto } from "./dto/sign-in.dto";
import { useAuthStore } from "./auth.store";
import { authService } from "./auth.service";

export function useAuth() {
  const queryClient = useQueryClient();
  const setLogin = useAuthStore((s) => s.setLogin);
  const setUser = useAuthStore((s) => s.setUser);

  const login = useMutation({
    mutationFn: (dto: SignInDto) => authService.login(dto),
    onSuccess: () => {
      setLogin(true);
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
      setLogin(false);
      setUser(null);
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
  };
}
