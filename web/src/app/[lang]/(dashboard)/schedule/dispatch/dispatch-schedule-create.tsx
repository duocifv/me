import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { throttle } from "lodash";
import { DeviceScheduleDto } from "@adapter/schedule/dto/device-schedule.dto";
import { useCreateDeviceScheduleMutation } from "@adapter/schedule/device.hook.";

export default function CreateScheduleSubmit(
  form: FormSubmit<DeviceScheduleDto>
) {
  const { mutate, isPending } = useCreateDeviceScheduleMutation();

  const throttledSubmit = useRef(
    throttle(
      (event) => {
        event?.preventDefault?.();
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
      {isPending ? <Loader2 className="animate-spin" /> : "Tạo lịch"}
    </Button>
  );
}
