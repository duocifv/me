import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserDto } from "@adapter/users/dto/user.dto";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { UpdateByAdminDto } from "@adapter/users/dto/update-by-admin.dto";
import AppLoading from "../../components/app-loading";
import { $t } from "@/app/lang";

const UsersUpdate = dynamic(() => import("./users-update"), {
  loading: () => <AppLoading />,
});

const UpdateUserSubmit = dynamic(
  () => import("../dispatch/dispatch-user-update"),
  {
    loading: () => <AppLoading />,
  }
);

export default function TableCellViewer({ item }: { item: UserDto }) {
  const valueRef = useRef<UpdateByAdminDto>({});
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground"
          >
            {item.email}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader className="gap-1">
            <SheetTitle>{item.email}</SheetTitle>
            <SheetDescription>
              {$t`Hiển thị tổng số lượt truy cập trong 6 tháng qua`}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
            <form className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="header">{$t`Người dùng`}</Label>
                <Input
                  id="header"
                  defaultValue={item.email}
                  tabIndex={-1}
                  readOnly
                />
              </div>
              <UsersUpdate item={item} valueRef={valueRef} />
              <div className="grid gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="target">{$t`Email`}</Label>
                  <Input id="target" defaultValue={item.email} readOnly />
                </div>
              </div>
              {/* Các trường như Enabled và Verified có thể thêm lại nếu cần */}
            </form>
          </div>
          <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default">{$t`Cập nhật người dùng`}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {$t`Xác nhận thay đổi trạng thái người dùng`}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {$t`Bạn có chắc muốn thay đổi trạng thái người dùng này?`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{$t`Hủy bỏ`}</AlertDialogCancel>
                  <UpdateUserSubmit valueRef={valueRef} id={item.id} />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                {$t`Đóng`}
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
