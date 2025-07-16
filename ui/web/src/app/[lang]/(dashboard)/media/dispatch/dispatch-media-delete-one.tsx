import { AlertDialog, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useMediaDeleteOneMutation } from "@adapter/media/media.hook";
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

export default function ButtonMediaDelete() {
  const fileId = useMediaStore((s) => s.fileId);
  const setFileId = useMediaStore((s) => s.setFileId);
  const { mutate } = useMediaDeleteOneMutation();
  const handleDelete = () => {
    if (!fileId) return;
    mutate(fileId, {
      onSuccess: () => {
        toast.success("Xóa thành công", {
          duration: 5000,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
        setFileId(null);
      },
      onError: ({ message }) => {
        toast.error(message ?? "Xóa thất bại", {
          duration: 5000,
          icon: <XCircle className="h-5 w-5 text-red-500" />,
        });
        setFileId(null);
      },
    });
  };

  return (
    <AlertDialog open={!!fileId} onOpenChange={() => setFileId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Thao tác này sẽ xóa mục vĩnh viễn khỏi hệ thống.
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
