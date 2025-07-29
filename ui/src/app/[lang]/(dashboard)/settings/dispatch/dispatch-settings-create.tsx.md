import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { CloudUpload, Loader2 } from "lucide-react";
import { useUpdateConfigScheduleMutation } from "@adapter/device/device.hook.";
import { useSubmit } from "@adapter/share/components/FormWrapper";
import { DeviceControlDto } from "@/module/device/dto/device-control.dto";
import { useDeviceScheduleQuery } from "@/module/schedule/device.hook";

export default function CreateSettingsSubmit(
  form: FormSubmit<DeviceControlDto>
) {
  const { data, isSuccess } = useDeviceScheduleQuery();
  const { submit } = useSubmit<DeviceControlDto>();
  const { mutate, isPending } = useUpdateConfigScheduleMutation();

  const onSubmit = submit((value) => {
    console.log("value", value, "data", data);
    // mutate(value, {
    //   onSuccess: () => {
    //     toast.success("Thay đổi thành công", {
    //       duration: 5000,
    //       icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    //     });
    //     form.reset();
    //   },
    //   onError: (err) => {
    //     toast.error(err.message, {
    //       duration: 5000,
    //       icon: <XCircle className="h-5 w-5 text-red-500" />,
    //     });
    //   },
    // });
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
    >
      <CloudUpload className="w-4 h-4 mr-2" />
      {isPending ? <Loader2 className="animate-spin" /> : "Lưu thay đổi"}
    </Button>
  );
}
