import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { CheckCircle, CloudUpload, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { throttle } from "lodash";
import { useCreateDeviceConfigMutation } from "@adapter/device/device.hook.";
import { CreateDeviceConfigDto } from "@adapter/device/dto/create-device-config.dto";

export default function CreateSettingsSubmit(
  form: FormSubmit<CreateDeviceConfigDto>
) {
  const { mutate, isPending } = useCreateDeviceConfigMutation();

  const throttledSubmit = useRef(
    throttle(
      (event) => {
        event?.preventDefault?.();
        form.handleSubmit((value) => {
          mutate(value, {
            onSuccess: () => {
              toast.success("Thay đổi thành công", {
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
      className="w-3xs"
      disabled={!form.formState.isDirty}
      formNoValidate
    >
      <CloudUpload className="w-4 h-4 mr-2" />
      {isPending ? <Loader2 className="animate-spin" /> : "Lưu thay đổi"}
    </Button>
  );
}
