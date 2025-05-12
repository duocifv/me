"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SignInDto } from "./dto/sign-in.dto";
import { useAuthStore } from "./auth.store";
import { useEffect } from "react";
import { authService } from "./auth.service";

export function useAuth() {
  const queryClient = useQueryClient();
  const setLogin = useAuthStore((s) => s.setLogin);
  const setUser = useAuthStore((s) => s.setUser);
  const loggedIn = useAuthStore((s) => s.loggedIn);

  const getMe = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.getMe(),
    enabled: !loggedIn,
  });

  useEffect(() => {
    if (!loggedIn && getMe.isSuccess && getMe.data) {
      setUser(getMe.data);
      setLogin(true);
    }
  }, [getMe.isSuccess]);

  useEffect(() => {
    if (!loggedIn && getMe.isError) {
      const error = getMe.error.message;
      if (error === "RefreshExpired") {
        setUser(null);
        setLogin(false);
      }
    }
  }, [getMe.isError, getMe.error]);

  const login = useMutation({
    mutationFn: (dto: SignInDto) => authService.login(dto),
    onSuccess: () => {
      setLogin(true);
      queryClient.invalidateQueries({ queryKey: ["me"] });
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
    loggedIn,
    login,
    register,
    logout,
    changePassword,
  };
}
