import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { throttle } from "lodash";
import { useCreatePlantTypeMutation } from "@adapter/plant-type/plant-type.hook.";
import { CreatePlantTypeDto } from "@adapter/plant-type/dto/create-plant-type.dto";

export default function CreatePlantTypeSubmit(
  form: FormSubmit<CreatePlantTypeDto>
) {
  const { mutate, isPending } = useCreatePlantTypeMutation();

  const throttledSubmit = useRef(
    throttle(
      (event) => {
        event?.preventDefault?.();
        form.handleSubmit((value) => {
          return mutate(value, {
            onSuccess: () => {
              toast.success("Đã tạo thành công", {
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
      {isPending ? <Loader2 className="animate-spin" /> : "Add Plant Type"}
    </Button>
  );
}
