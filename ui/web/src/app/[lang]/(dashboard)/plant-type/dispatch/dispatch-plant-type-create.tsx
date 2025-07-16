import { Button } from "@/components/ui/button";
import { FormSubmit } from "@adapter/share/type/form";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useCreatePlantTypeMutation } from "@adapter/plant-type/plant-type.hook.";
import { CreatePlantTypeDto } from "@adapter/plant-type/dto/create-plant-type.dto";
import { useSubmit } from "@adapter/share/components/FormWrapper";

export default function CreatePlantTypeSubmit(
  form: FormSubmit<CreatePlantTypeDto>
) {
  const { submit } = useSubmit<CreatePlantTypeDto>();
  const { mutate, isPending } = useCreatePlantTypeMutation();

  const onSubmit = submit((value) => {
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
  });

  return (
    <Button
      type="submit"
      onClick={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      formNoValidate
      className="w-32"
      disabled={!form.formState.isDirty}
    >
      {isPending ? <Loader2 className="animate-spin" /> : "Add Plant Type"}
    </Button>
  );
}
