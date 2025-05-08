import { ChevronDownIcon, ColumnsIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUsers } from "@adapter/users";
import { Roles } from "@adapter/roles/dto/role.enum";
import { UserStatus } from "@adapter/users/dto/user-status.enum";
import { useDebounce } from "@adapter/share/hooks/use-debounce";
import { Table } from "@tanstack/react-table";
import { UserDto } from "@adapter/users/dto/user.dto";
import dynamic from "next/dynamic";
const UsersAddDialog = dynamic(() => import("./users-add"));

export default function UsersFilter({ table }: { table: Table<UserDto> }) {
  const { filters, setFilters } = useUsers();
  const handleSearch = useDebounce((search: string) => {
    setFilters({ search });
  });
  const handleSortRoles = useDebounce((value: string) => {
    setFilters({ roles: value !== "all" ? [value as Roles] : [] });
  });
  const handleSortStatus = useDebounce((value: string) => {
    setFilters({ status: value !== "all" ? [value as UserStatus] : [] });
  });

  return (
    <div className="flex items-center justify-between ">
      <Input
        placeholder="Filter emails..."
        defaultValue={""}
        onChange={({ target }) => handleSearch(target.value)}
        className="max-w-sm"
      />
      <div className="flex items-center gap-2">
        {/* Role Filter */}
        <Select
          value={filters.roles?.[0] ?? "all"}
          onValueChange={(value) => handleSortRoles(value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.values(Roles).map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status?.[0] ?? "all"}
          onValueChange={(value) => handleSortStatus(value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(UserStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ColumnsIcon />
              <span className="hidden lg:inline">ViewsColumns</span>
              <span className="lg:hidden">Columns</span>
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
        <UsersAddDialog />
      </div>
    </div>
  );
}
