import { AlertDialog, AlertDialogAction } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { usePlantTypeStore } from "@adapter/plant-type/plant-type.store";
import { useRemoveUserMutation } from "@adapter/plant-type/plant-type.hook.";
import { ApiError } from "next/dist/server/api-utils";

export default function ButtonPlantTypeDelete() {
  const id = usePlantTypeStore((s) => s.selectedPlantId);
  const setSelectedPlantId = usePlantTypeStore((s) => s.setSelectedPlantId);
  const removePlant = usePlantTypeStore((s) => s.removePlant);

  const { mutate } = useRemoveUserMutation();

  const handleDelete = () => {
    if (!id) return;
    mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Xóa plant thành công", {
            duration: 5000,
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          });
          removePlant(id);
          setSelectedPlantId(null);
        },
        onError: (error) => {
          toast.error(error.message || "Xóa thất bại", {
            duration: 5000,
            icon: <XCircle className="h-5 w-5 text-red-500" />,
          });
          setSelectedPlantId(null);
        },
      }
    );
  };

  return (
    <AlertDialog open={!!id} onOpenChange={() => setSelectedPlantId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Thao tác này sẽ xóa loại cây vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Xác nhận xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
