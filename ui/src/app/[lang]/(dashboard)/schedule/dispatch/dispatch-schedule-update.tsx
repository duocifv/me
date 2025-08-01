import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { throttle } from "lodash";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { UpdateScheduleDto } from "@/module/schedule/dto/update-schedule.dto";
import { useUpdateDeviceScheduleMutation } from "@/module/schedule/device.hook";

type Props = {
  id: number;
  form: FormSubmit<UpdateScheduleDto>;
};

export default function UpdateScheduleSubmit({ id, form }: Props) {
  const { mutate, isPending } = useUpdateDeviceScheduleMutation();

  const throttledSubmit = useRef(
    throttle(
      (event) => {
        event?.preventDefault?.();
        form.handleSubmit((dto) => {
          mutate(
            {
              id,
              dto,
            },
            {
              onSuccess: () => {
                toast.success("Thay đổi trạng thái thành công", {
                  duration: 5000,
                  icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                });
              },
              onError: () => {
                toast.error("Thay đổi trạng thái thất bại", {
                  duration: 5000,
                  icon: <XCircle className="h-5 w-5 text-red-500" />,
                });
              },
            }
          );
        })();
      },
      2000,
      { leading: true, trailing: false }
    )
  );
  return (
    <Button
      onClick={throttledSubmit.current}
      className="w-32"
      disabled={isPending}
      formNoValidate
    >
      {isPending ? <Loader2 className="animate-spin" /> : "Cập nhật lịch"}
    </Button>
  );
}
