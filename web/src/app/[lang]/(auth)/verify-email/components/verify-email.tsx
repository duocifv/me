"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuthVerifyEmailMutation } from "@adapter/auth/auth.hook";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutate, isPending, isSuccess, isError } =
    useAuthVerifyEmailMutation();

  useEffect(() => {
    if (!token) {
      toast.error("Thiếu token xác thực email", {
        icon: <XCircle className="text-red-500 w-5 h-5" />,
      });
      return;
    }

    mutate(token, {
      onError: (error) => {
        toast.error(error.message, {
          icon: <XCircle className="text-red-500 w-5 h-5" />,
        });
      },
    });
  }, [token, mutate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        {isPending && (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
            <p className="text-lg font-semibold">Đang xác thực email...</p>
          </>
        )}
        {!isPending && isError && (
          <>
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold">Xác thực email thất bại</p>
          </>
        )}
        {!isPending && isSuccess && (
          <>
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold">Hoàn tất xác thực</p>
            <Link href="/en/login">
              <Button>Quay về đăng nhập</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
