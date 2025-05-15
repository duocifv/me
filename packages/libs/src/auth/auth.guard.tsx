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
  const [hydrationDone, setHydrationDone] = useState(false);
  const setLogin = useAuthStore((s) => s.setLogin);

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

  if (hydrationDone && loggedIn) {
    return <AuthenticatedApp>{children}</AuthenticatedApp>;
  }

  return hydrationDone && <>{fallback}</>;
}

function AuthenticatedApp({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isSuccess, isError } = useQuery({
    queryKey: ["me", user?.email],
    queryFn: () => authService.getMe(),
    enabled: user === null,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess && data) setUser(data);
    if (isError) setUser(null);
  }, [isSuccess, isError, data, setUser]);

  return <>{children}</>;
}
