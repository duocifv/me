"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "./auth.store";
import { errorHandler } from "../share/api/errorHandler";
import { logout, useAuthProfileQuery } from "./auth.hook";
import AppLoading from "@/app/[lang]/(dashboard)/components/app-loading";

export function AuthGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const isLoggedInState = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const setLogin = useAuthStore((s) => s.setLogin);
  const setLogout = useAuthStore((s) => s.setLogout);
  console.log("| đã đăng nhập");
  useEffect(() => {
    try {
      const login = localStorage.getItem("IS_LOGGED_IN") !== null;
      setIsLoggedIn(login);
      if (login) {
        setLogin();
      } else {
        setLogout();
      }
    } catch {
      setIsLoggedIn(false);
      setLogout();
    }
  }, [setLogin, setLogout, isLoggedInState]);

  useEffect(() => {
    const unsub = errorHandler.register((err) => {
      if (err instanceof Error && err.name === "RefreshExpired") {
        setLogout();
        return true;
      }
      return false;
    });
    return () => unsub();
  }, [setLogout]);

  if (isLoggedIn === null) return <AppLoading />; // Đợi xác định trạng thái đăng nhập

  if (isLoggedIn && user === null) {
    return <AuthenticatedApp>{children}</AuthenticatedApp>;
  }

  if (!isLoggedIn) {
    return <>{fallback}</>;
  }

  return children;
}

function AuthenticatedApp({ children }: { children: React.ReactNode }) {
  const { data, isSuccess, isError } = useAuthProfileQuery();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
  }, [isSuccess, data, setUser]);

  useEffect(() => {
    if (isError) {
      logout();
      setUser(null);
    }
  }, [isError, setUser]);

  if (!isSuccess || !user) return <AppLoading />;
  return children;
}
