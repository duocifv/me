import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UserDto } from "@adapter/users/dto/user.dto";
import { UserStatus } from "@adapter/users/dto/user-status.enum";
import { Label } from "@/components/ui/label";
import { UpdateByAdminDto } from "@adapter/users/dto/update-by-admin.dto";
import { RefObject } from "react";
import { Roles } from "@adapter/roles/dto/roles.enum";
import { $t } from "@/app/lang";

type Props = {
  item: UserDto;
  valueRef: RefObject<UpdateByAdminDto>;
};

export default function UsersUpdate({ item, valueRef }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="ROLE">{$t`Vai trò`}</Label>
        <Select
          defaultValue={item.roles[0]?.name}
          onValueChange={(roles: Roles) => {
            valueRef.current.roles = [roles];
          }}
        >
          <SelectTrigger id="role" className="w-full">
            <SelectValue placeholder={$t`Chọn vai trò`} />
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
      <div className="flex flex-col gap-3">
        <Label htmlFor="STATUS">{$t`Trạng thái`}</Label>
        <Select
          defaultValue={item.status}
          onValueChange={(status: UserStatus) => {
            valueRef.current.status = [status];
          }}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder={$t`Chọn trạng thái`} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
