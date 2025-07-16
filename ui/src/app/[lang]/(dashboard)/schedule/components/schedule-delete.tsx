"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { useDeleteDeviceScheduleMutation } from "@adapter/schedule/device.hook.";

// 💥 Nút xóa có xác nhận
export function ScheduleButtonDelete({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const deleteSchedule = useDeleteDeviceScheduleMutation();

  const confirmDelete = () => {
    deleteSchedule.mutate(id, {
      onSuccess: () => {
        toast.success("Đã xóa lịch thành công");
        setOpen(false);
      },
      onError: () => toast.error("Xóa thất bại"),
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa lịch này không?
          </p>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
