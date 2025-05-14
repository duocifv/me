"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "./auth.store";
import { authService } from "./auth.service";
import { useQuery } from "@tanstack/react-query";
import { errorHandler } from "../share/api/errorHandler";

export function AuthGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const loggedIn = useAuthStore((s) => s.loggedIn);
  const user = useAuthStore((s) => s.user);
  const [hydrationDone, setHydrationDone] = useState(false);
  const setLogin = useAuthStore((s) => s.setLogin);
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isSuccess, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.getMe(),
    enabled: loggedIn === true && !user,
    retry: false,
  });

  useEffect(() => {
    (async () => {
      if (!useAuthStore.persist.hasHydrated()) {
        await useAuthStore.persist.rehydrate();
      }
      setHydrationDone(true);
    })();
  }, []);

  useEffect(() => {
    const unsub = errorHandler.register((err) => {
      if (err instanceof Error && err.name === "RefreshExpired") {
        setLogin(false);
        return true;
      }
      return false;
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
    if (isError) {
      setUser(null);
    }
  }, [user, data, isSuccess, isError]);

  if (hydrationDone && loggedIn) {
    return <>{children}</>;
  }

  return hydrationDone && <>{fallback}</>;
}
