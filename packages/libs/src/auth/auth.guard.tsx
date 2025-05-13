"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "./auth.store";
import { authService } from "./auth.service";
import { useQuery } from "@tanstack/react-query";

export function AuthGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const loggedIn = useAuthStore((s) => s.loggedIn);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setLogin = useAuthStore((s) => s.setLogin);
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isSuccess, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.getMe(),
    enabled: !!loggedIn && !user,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
      setLogin(true);
    }
    if (isError) {
      setUser(null);
      setLogin(false);
    }
  }, [user, isSuccess, data, loggedIn]);

  // if (loggedIn === null && hydrated === false) {
  //   setTimeout(()=>{

  //   })
  // }
   const [hydrationDone, setHydrationDone] = useState(false);

   useEffect(() => {
    (async () => {
      await waitForHydration();
      setHydrationDone(true);
    })();
  }, []);

  // if (!hydrationDone) {
  //   return <p>Đang tải…</p>;
  // }

  if (hydrationDone && loggedIn) {
    return <>{children}</>;
  }

  return hydrationDone && <>{fallback}</>;
}



export async function waitForHydration(): Promise<void> {
  // nếu chưa hydrate thì gọi rehydrate()
  if (!useAuthStore.persist.hasHydrated()) {
    await useAuthStore.persist.rehydrate();
  }
}