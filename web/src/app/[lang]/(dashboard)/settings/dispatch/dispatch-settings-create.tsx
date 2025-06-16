import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { CheckCircle, CloudUpload, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useCreateDeviceConfigMutation } from "@adapter/device/device.hook.";
import { CreateDeviceConfigDto } from "@adapter/device/dto/create-device-config.dto";
import { useSubmit } from "@adapter/share/components/FormWrapper";

export default function CreateSettingsSubmit(
  form: FormSubmit<CreateDeviceConfigDto>
) {
  const { submit } = useSubmit<CreateDeviceConfigDto>();
  const { mutate, isPending } = useCreateDeviceConfigMutation();

  const onSubmit = submit((value) => {
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
  });

  return (
    <Button
      type="submit"
      onClick={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      formNoValidate
      className="w-3xs"
      disabled={!form.formState.isDirty}
    >
      <CloudUpload className="w-4 h-4 mr-2" />
      {isPending ? <Loader2 className="animate-spin" /> : "Lưu thay đổi"}
    </Button>
  );
}
