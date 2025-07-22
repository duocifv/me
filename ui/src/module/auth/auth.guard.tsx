"use client";

import { useEffect } from "react";
import { useAuthStore } from "./auth.store";
import { errorHandler } from "../share/api/errorHandler";
import { loggedIn, useAuthProfileQuery } from "./auth.hook";
import AppLoading from "@/app/[lang]/(dashboard)/components/app-loading";

export function AuthGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const stogareLoggedIn = loggedIn();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const setLogin = useAuthStore((s) => s.setLogin);
  const setLogout = useAuthStore((s) => s.setLogout);

  useEffect(() => {
    if (!stogareLoggedIn) {
      return setLogout();
    }
    return setLogin();
  }, [stogareLoggedIn, setLogin, setLogout, isLoggedIn]);

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

  console.log("================start auth===================");
  console.log("isStogareLoggedIn:", stogareLoggedIn);
  console.log("================end auth===================");

  if (!stogareLoggedIn && isLoggedIn === false) {
    return <>{fallback}</>;
  }
  if (stogareLoggedIn && isLoggedIn === true) {
    return <AuthenticatedApp>{children}</AuthenticatedApp>;
  }
  return <AppLoading />;
}

function AuthenticatedApp({ children }: { children: React.ReactNode }) {
  const { data, isSuccess, isError } = useAuthProfileQuery();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  useEffect(() => {
    if (isSuccess && data) setUser(data);
    if (isError) setUser(null);
  }, [isSuccess, isError, data, setUser]);

  return user && children;
}
