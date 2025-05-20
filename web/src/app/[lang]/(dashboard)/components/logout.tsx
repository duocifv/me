"use client";
import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { useAuthLogoutMutation } from "@adapter/auth/auth.hook";
import { useAuthStore } from "@adapter/auth/auth.store";

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
        ? "Đang đăng xuất..."
        : isLoggedIn
        ? "Đăng xuất"
        : "Đã đăng xuất"}
    </AlertDialogAction>
  );
}
