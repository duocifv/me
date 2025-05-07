import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Roles } from "@adapter/roles/dto/role.enum";
import { UserDto } from "@adapter/users/dto/user.dto";
import { useUsers } from "@adapter/users";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function UsersUpdateRole({ item }: { item: UserDto }) {
  const { updateUser } = useUsers();

  const valueRef = useRef<string>("");
  const [openDialog, setOpenDialog] = useState(false);

  const handleUpdateRole = (newRoles: Roles) => {
    updateUser.mutate(
      {
        id: item.id,
        body: { roles: [newRoles] },
      },
      {
        onSuccess: () => {
          toast.success("Thay đổi quyền thành công", {
            duration: 5000,
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          });
        },
        onError: () => {
          toast.error("Thay đổi quyền thất bại", {
            duration: 5000,
            icon: <XCircle className="h-5 w-5 text-red-500" />,
          });
        },
      }
    );
  };

  const handleRoleChange = (value: string) => {
    valueRef.current = value;
    setOpenDialog(true);
  };

  const confirmRoleChange = () => {
    handleUpdateRole(valueRef.current as Roles);
    setOpenDialog(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="ROLE">ROLE</Label>
        <Select value={item.roles[0]?.name} onValueChange={handleRoleChange}>
          <SelectTrigger id="type" className="w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Roles).map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận thay đổi vai trò</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn thay đổi vai trò của người dùng này?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRoleChange}>
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
