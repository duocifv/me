import { RefObject } from "react";
import { UpdateByAdminDto } from "@adapter/users/dto/update-by-admin.dto";
import { useUpdateUserMutation } from "@adapter/users/users.hook.";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { throttle } from "lodash";
import { AlertDialogAction } from "@/components/ui/alert-dialog";

export default function UpdateUserSubmit({
  valueRef,
  id,
}: {
  valueRef: RefObject<UpdateByAdminDto>;
  id: string;
}) {
  const { mutate, isPending } = useUpdateUserMutation();

  const throttledSubmit = throttle(
    () => {
      const body = valueRef.current;
      if (!body || Object.keys(body).length === 0) return;

      mutate(
        {
          id,
          dto: body,
        },
        {
          onSuccess: () => {
            toast.success("Thay đổi trạng thái thành công", {
              duration: 5000,
              icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            });
            valueRef.current = {};
          },
          onError: () => {
            toast.error("Thay đổi trạng thái thất bại", {
              duration: 5000,
              icon: <XCircle className="h-5 w-5 text-red-500" />,
            });
          },
        }
      );
    },
    300,
    { trailing: false }
  );

  return (
    <AlertDialogAction onClick={throttledSubmit} disabled={isPending}>
      Xác nhận
      {isPending ? <Loader2 className="animate-spin" /> : "Update User"}
    </AlertDialogAction>
  );
}
