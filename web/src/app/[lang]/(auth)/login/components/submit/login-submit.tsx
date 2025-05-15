import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { throttle } from "lodash";
import { useMemo } from "react";
import { useAuthLoginMutation } from "@adapter/auth/auth.api";
import { SignInDto } from "@adapter/auth/dto/sign-in.dto";

export function LoginSubmit(form: FormSubmit<SignInDto>) {
  const { mutate, isPending } = useAuthLoginMutation();
  const throttledSubmit = useMemo(
    () =>
      throttle(
        form.handleSubmit((value) => {
          mutate(value, {
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
          });
        }),
        2000,
        { leading: true, trailing: false }
      ),
    [form, mutate]
  );

  return (
    <Button
      onClick={throttledSubmit}
      className="w-24"
      disabled={isPending}
      formNoValidate
    >
      {isPending ? <Loader2 className="animate-spin" /> : "Login"}
    </Button>
  );
}
