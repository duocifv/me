"use client";
import { Button } from "@/components/ui/button";
import { useAuthResetPasswordMutation } from "@adapter/auth/auth.hook";
import { ResetPasswordDto } from "@adapter/auth/dto/reset-password";
import { FormSubmit } from "@adapter/share/type/form";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ResetPasswordSubmit(form: FormSubmit<ResetPasswordDto>) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { mutate, isPending } = useAuthResetPasswordMutation();

  const handleSubmit = form.handleSubmit((values) => {
    if (!token) {
      toast.error("Token đặt lại mật khẩu không hợp lệ hoặc bị thiếu", {
        duration: 5000,
        icon: <XCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }
    mutate(
      {
        token,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Đặt lại mật khẩu thành công", {
            duration: 5000,
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          });
        },
        onError: (err) => {
          toast.error(err.message || "Đã có lỗi xảy ra", {
            duration: 5000,
            icon: <XCircle className="h-5 w-5 text-red-500" />,
          });
        },
      }
    );
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="w-32 mt-6 flex items-center justify-center"
      formNoValidate
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        "Đặt lại mật khẩu"
      )}
    </Button>
  );
}
