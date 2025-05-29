"use client";
import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthRegisterMutation } from "@adapter/auth/auth.hook";
// import { CaptchaStatus, useAuthStore } from "@adapter/auth/auth.store";
import { RegisterDto } from "@adapter/auth/dto/register.dto";

export function RegisterSubmit(form: FormSubmit<RegisterDto>) {
  const { mutate, isPending } = useAuthRegisterMutation();
  // const captcha = useAuthStore((s) => s.captcha);
  // const setCaptcha = useAuthStore((s) => s.setCaptcha);

  const handleSubmit = form.handleSubmit((value) => {
    const data = value;
    // if (captcha.status === CaptchaStatus.Failed) return null;
    // if (captcha.status === CaptchaStatus.Success && captcha.token) {
    //   data.captchaToken = captcha.token;
    // }
    mutate(data, {
      onSuccess: () => {
        toast.success("Đăng nhập thành công", {
          duration: 5000,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
      },
      onError: (err) => {
        toast.error(err.message, {
          duration: 5000,
          icon: <XCircle className="h-5 w-5 text-red-500" />,
        });
      },
      // onSettled: () => {
      //   if (captcha.status === CaptchaStatus.Success && captcha.token) {
      //     setCaptcha({
      //       status: CaptchaStatus.Failed,
      //     });
      //   }
      // },
    });
  });

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      className="w-24 mt-6"
      disabled={isPending}
      formNoValidate
    >
      {isPending ? <Loader2 className="animate-spin" /> : "Sign up"}
    </Button>
  );
}
