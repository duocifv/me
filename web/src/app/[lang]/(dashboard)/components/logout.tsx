"use client";
import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { useAuth } from "@adapter/auth/auth";
import { useAuthStore } from "@adapter/auth/auth.store";

export default function Logout() {
  const { logout } = useAuth();
  const isLoggedIn = useAuthStore((s) => s.loggedIn);

  return (
    <AlertDialogAction
      onClick={() => {
        logout.mutate();
      }}
    >
      {logout.isPending
        ? "Đang đăng xuất..."
        : isLoggedIn
        ? "Đăng xuất"
        : "Đã đăng xuất"}
    </AlertDialogAction>
  );
}
