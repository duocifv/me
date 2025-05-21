import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMediaDeleteManyMutation } from "@adapter/media/media.hook";
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
import { useMediaStore } from "@adapter/media/media.store";
import { Button } from "@/components/ui/button";

export function ButtonMediaDeleteMany() {
  const fileIds = useMediaStore((s) => s.fileIds);
  const clearFileIds = useMediaStore((s) => s.clearFileIds);
  const { mutate, isPending } = useMediaDeleteManyMutation();

  const handleDelete = () => {
    if (!fileIds || fileIds.length === 0) return;
    mutate(
      { ids: fileIds },
      {
        onSuccess: () => {
          toast.success("Xóa thành công", {
            duration: 5000,
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          });
          clearFileIds();
        },
        onError: ({ message }) => {
          toast.error(message ?? "Xóa thất bại", {
            duration: 5000,
            icon: <XCircle className="h-5 w-5 text-red-500" />,
          });
        },
      }
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={fileIds.length === 0}>
          Delete all
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Bạn có chắc chắn muốn xóa các file đã chọn?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Thao tác này sẽ xóa các mục vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            Xác nhận xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
