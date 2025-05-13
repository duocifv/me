"use client";
import { useEffect } from "react";
import { useAuth } from "@adapter/auth/auth";
import { Button } from "@/components/ui/button";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    if (logout.isSuccess) {
      alert("Đăng xuất thành công!");
    }
  }, [logout.isSuccess]);

  return (
    <Button
      onClick={() => {
        logout.mutate();
      }}
      disabled={logout.isPending}
    >
      {logout.isPending ? "Đang đăng xuất..." : "Log out"}
    </Button>
  );
}
