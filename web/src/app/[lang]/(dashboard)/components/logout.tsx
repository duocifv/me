"use client";
import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { useAuthLogoutMutation } from "@adapter/auth/auth.api";
import { useAuthStore } from "@adapter/auth/auth.store";

export default function Logout() {
  const { mutate, isPending } = useAuthLogoutMutation();
  const isLoggedIn = useAuthStore((s) => s.loggedIn);

  return (
    <AlertDialogAction onClick={() => mutate()}>
      {isPending
        ? "Đang đăng xuất..."
        : isLoggedIn
        ? "Đăng xuất"
        : "Đã đăng xuất"}
    </AlertDialogAction>
  );
}
