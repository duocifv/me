"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthRegisterMutation } from "@adapter/auth/auth.hook";
import { RegisterDto } from "@adapter/auth/dto/register.dto";
import { useSubmit } from "@adapter/share/components/FormWrapper";

export function RegisterSubmit() {
  const { submit } = useSubmit<RegisterDto>();
  const { mutate, isPending } = useAuthRegisterMutation();
  // const captcha = useAuthStore((s) => s.captcha);
  // const setCaptcha = useAuthStore((s) => s.setCaptcha);

  const onSubmit = submit((value) => {
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

  return (
    <Button
      type="submit"
      onClick={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      formNoValidate
      className="w-24 mt-6"
      disabled={isPending}
    >
      {isPending ? <Loader2 className="animate-spin" /> : "Sign up"}
    </Button>
  );
}
