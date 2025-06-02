"use client";

import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { useAuthLogoutMutation } from "@adapter/auth/auth.hook";
import { useAuthStore } from "@adapter/auth/auth.store";
import { $t } from "@/app/lang";

export default function Logout() {
  const { mutate, isPending } = useAuthLogoutMutation();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const setLogout = useAuthStore((s) => s.setLogout);

  const handleLogout = () => {
    mutate();
    setLogout();
  };

  return (
    <AlertDialogAction onClick={handleLogout}>
      {isPending
        ? $t`Đang đăng xuất...`
        : isLoggedIn
        ? $t`Đăng xuất`
        : $t`Đã đăng xuất`}
    </AlertDialogAction>
  );
}
