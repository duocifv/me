import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUsers } from "@adapter/users";
import { TrashIcon } from "lucide-react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UserDto } from "@adapter/users/dto/user.dto";
import { Label } from "@/components/ui/label";
import { Roles } from "@adapter/roles/dto/role.enum";

const UserRoleSelector = ({
  item,
  onRoleChange,
}: {
  item: UserDto;
  onRoleChange: (newRoles: Roles[]) => void;
}) => {
  const [selectedRole, setSelectedRole] = useState(item.roles[0]?.name);

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    onRoleChange([newRole as Roles]);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="type">ROLE</Label>
      <Select value={selectedRole} onValueChange={handleRoleChange}>
        <SelectTrigger id="type" className="w-full">
          <SelectValue placeholder="Select a type" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(Roles).map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default function UsersTableActions({ item }: { item: UserDto }) {
  const { updateUser } = useUsers();

  const handleRoleChange = (newRoles: Roles[]) => {
    updateUser.mutate(
      {
        id: item.id,
        body: { roles: newRoles },
      },
      {
        onSuccess: () => {
          toast.success("Thay đổi quyền thành công", {
            duration: 5000,
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          });
        },
        onError: () =>
          toast.error("Thay đổi quyền thất bại", {
            duration: 5000,
            icon: <XCircle className="h-5 w-5 text-red-500" />,
          }),
      }
    );
  };

  const handleDelete = () => {
    toast.success("Xóa người dùng thành công", {
      duration: 5000,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    });
  };

  return (
    <div>
      <UserRoleSelector item={item} onRoleChange={handleRoleChange} />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
