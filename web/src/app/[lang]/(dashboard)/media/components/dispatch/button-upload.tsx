import { Button } from "@/components/ui/button";
import { useMediaMutation } from "@adapter/media/media.hook";
import { useMediaStore } from "@adapter/media/media.store";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function ButtonUpload() {
  const setFileInfo = useMediaStore((s) => s.setFileInfo);
  const { mutate, isPending, error } = useMediaMutation();
  return (
    <Button
      onClick={() =>
        mutate(undefined, {
          onSuccess: () => {
            toast.success("Upload thành công", {
              duration: 5000,
              icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            });
            setFileInfo();
          },
          onError: () => {
            toast.error(error?.message ?? "Upload thất bại", {
              duration: 5000,
              icon: <XCircle className="h-5 w-5 text-red-500" />,
            });
          },
        })
      }
      disabled={isPending}
    >
      {isPending ? <Loader2 className="animate-spin" /> : "Xác nhận"}
    </Button>
  );
}
