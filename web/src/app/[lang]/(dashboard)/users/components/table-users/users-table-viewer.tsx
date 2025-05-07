import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
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
import { Switch } from "@/components/ui/switch";
import { useRef } from "react";
import { UpdateByAdminDto } from "@adapter/users/dto/update-by-admin.dto";
import { useUsers } from "@adapter/users";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import UsersUpdate from "./users-update";

export default function TableCellViewer({ item }: { item: UserDto }) {
  const { updateUser } = useUsers();

  const valueRef = useRef<UpdateByAdminDto>({});
  const handleUpdateUser = () => {
    let body = valueRef.current;
    if (body && Object.keys(body).length > 0) {
      body = valueRef.current;
    } else {
      console.log("body", body);
      return;
    }

    updateUser.mutate(
      {
        id: item.id,
        body,
      },
      {
        onSuccess: () => {
          toast.success("Thay đổi trạng thái thành công", {
            duration: 5000,
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          });
          valueRef.current = {};
        },
        onError: () => {
          toast.error("Thay đổi trạng thái thất bại", {
            duration: 5000,
            icon: <XCircle className="h-5 w-5 text-red-500" />,
          });
        },
      }
    );
  };

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
              Showing total visitors for the last 6 months
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
            <form className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="header">USER</Label>
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
                  <Label htmlFor="target">Email</Label>
                  <Input id="target" defaultValue={item.email} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="enabled">ENABLED</Label>
                  <Switch
                    id="enabled"
                    defaultChecked={item.isActive}
                    onCheckedChange={(val) => {
                      valueRef.current.isActive = val;
                    }}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="verified">VERIFIED</Label>
                  <Switch id="verified" checked={item.isEmailVerified} />
                </div>
              </div>
            </form>
          </div>
          <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default">Update User</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Xác nhận thay đổi trạng thái người dùng
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc muốn thay đổi trạng thái người dùng này?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUpdateUser}>
                    Xác nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
