import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { CreateUserDto } from "@adapter/users/dto/create-user.dto";
import { useCreateUserMutation } from "@adapter/users/users.hook.";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { throttle } from "lodash";
import { useMemo } from "react";

export default function CreateUserSubmit(form: FormSubmit<CreateUserDto>) {
  const { mutate, isPending } = useCreateUserMutation();

  const throttledSubmit = useMemo(
    () =>
      throttle(
        form.handleSubmit((value) => {
          mutate(value, {
            onSuccess: () => {
              toast.success("Tạo tài khoản thành công", {
                duration: 5000,
                icon: <CheckCircle className="h-5 w-5 text-green-500" />,
              });
              form.reset();
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
      {isPending ? <Loader2 className="animate-spin" /> : "Create User"}
    </Button>
  );
}
