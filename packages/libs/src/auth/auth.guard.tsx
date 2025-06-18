"use client";

import { useEffect } from "react";
import { useAuthStore } from "./auth.store";
import { errorHandler } from "../share/api/errorHandler";
import { loggedIn, useAuthProfileQuery } from "./auth.hook";

export function AuthGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const isStogareLoggedIn = loggedIn();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const setLogin = useAuthStore((s) => s.setLogin);
  const setLogout = useAuthStore((s) => s.setLogout);
  useEffect(() => {
    setLogin(isStogareLoggedIn);
  }, [isLoggedIn, setLogin]);

  useEffect(() => {
    const unsub = errorHandler.register((err) => {
      if (err instanceof Error && err.name === "RefreshExpired") {
        setLogout();
        return true;
      }
      return false;
    });
    return () => unsub();
  }, []);
  console.log("================start auth===================");
  console.log("isStogareLoggedIn:", isStogareLoggedIn);
  console.log("isLoggedIn:", isLoggedIn);
  console.log("================end auth===================");
  if (isLoggedIn === false) {
    return <>{fallback}</>;
  }
  if (isLoggedIn) {
    return <AuthenticatedApp>{children}</AuthenticatedApp>;
  }
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
