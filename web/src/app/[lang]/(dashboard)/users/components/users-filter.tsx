import { ChevronDownIcon, ColumnsIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Roles } from "@adapter/roles/dto/roles.enum";
import { UserStatus } from "@adapter/users/dto/user-status.enum";
import { useDebounce } from "@adapter/share/hooks/use-debounce";
import { Table } from "@tanstack/react-table";
import { UserDto } from "@adapter/users/dto/user.dto";
import dynamic from "next/dynamic";
import { useUsersStore } from "@adapter/users/users.store";
import { GetUsersDto, GetUsersSchema } from "@adapter/users/dto/get-users.dto";
import { UserSearch } from "./user-search";
import AppLoading from "../../components/app-loading";
import { $t } from "@/app/lang";

const UsersAddDialog = dynamic(() => import("./users-add"), {
  loading: () => <AppLoading />,
});

export default function UsersFilter({ table }: { table: Table<UserDto> }) {
  const filters = useUsersStore((s) => s.filters);
  const setFilters = useUsersStore((s) => s.setFilters);

  const handleFilters = useDebounce((partial: Partial<GetUsersDto>) => {
    const merged = { ...filters, ...partial };
    const parsed = GetUsersSchema.safeParse(merged);
    if (parsed.success) {
      setFilters(parsed.data);
    } else {
      console.warn("Invalid filter:", parsed.error.errors);
    }
  }, 300);

  const onRoleChange = (val: string) => {
    handleFilters({ roles: val === "all" ? [] : [val as Roles] });
  };

  const onStatusChange = (val: string) => {
    handleFilters({ status: val === "all" ? [] : [val as UserStatus] });
  };

  return (
    <div className="flex items-center justify-between">
      <UserSearch />
      <div className="flex items-center gap-2">
        {/* Bộ lọc Vai trò */}
        <Select
          value={filters.roles?.[0] ?? "all"}
          onValueChange={(value) => onRoleChange(value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={$t`Lọc theo vai trò`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{$t`Tất cả vai trò`}</SelectItem>
            {Object.values(Roles).map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bộ lọc Trạng thái */}
        <Select
          value={filters.status?.[0] ?? "all"}
          onValueChange={(value) => onStatusChange(value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={$t`Lọc theo trạng thái`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{$t`Tất cả trạng thái`}</SelectItem>
            {Object.values(UserStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Hiển thị cột */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ColumnsIcon />
              <span className="hidden lg:inline">{$t`Hiển thị cột`}</span>
              <span className="lg:hidden">{$t`Cột`}</span>
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Nút thêm người dùng */}
        <UsersAddDialog />
      </div>
    </div>
  );
}
