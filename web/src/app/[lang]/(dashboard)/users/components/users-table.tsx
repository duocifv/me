"use client";
import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import dynamic from "next/dynamic";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  BanIcon,
  CheckCircle,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserDto } from "@adapter/users/dto/user.dto";
import { useUsers } from "@adapter/users/users";
import { IUserListResponseSchema } from "@adapter/users/dto/user-list.dto";
import { useUsersStore } from "@adapter/users/users.store";
// import { useUsersStore } from "@adapter/users/users.store";

// const UsersFilter = dynamic(() => import("./users-filter"));
// const TableCellViewer = dynamic(() => import("./users-table-viewer"));
// const DraggableRow = dynamic(() => import("./draggable-row"));

const columns: ColumnDef<UserDto>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "USER",
    header: "USER",
    cell: ({ row }) => {
      // return <TableCellViewer item={row.original} />;
      return <div>TableCellViewer</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "ROLE",
    header: "ROLE",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.roles[0]?.name ?? "GUEST"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "VERIFIED",
    header: "VERIFIED",
    cell: ({ row }) => {
      const isEmailVerified = row.original.isEmailVerified;
      const Icon = isEmailVerified ? CheckCircle : XCircle;
      const iconColor = isEmailVerified ? "text-green-500" : "text-red-500";

      return (
        <div className="w-16 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      );
    },
  },
  {
    accessorKey: "ENABLED",
    header: "ENABLED",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      const Icon = isActive ? CheckCircle : XCircle;
      const iconColor = isActive ? "text-green-500" : "text-red-500";

      return (
        <div className="w-16 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      );
    },
  },
  {
    accessorKey: "STATUS",
    header: "STATUS",
    cell: ({ row }) => {
      const status = row.original.status;

      const iconMap = {
        active: (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ),
        pending: <Clock className="text-yellow-500 dark:text-yellow-400" />,
        blocked: <BanIcon className="text-red-500 dark:text-red-400" />,
      };

      return (
        <Badge
          variant="outline"
          className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
        >
          {iconMap[status]}
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
];

let render = 0;

export default function DataTableUsers() {
  const filters = useUsersStore((s) => s.filters);
  const users = useUsersStore((s) => s.data);
  
  const isLoading = false;
  const currentPage = users?.meta.currentPage ?? 1;
  const totalPages = users?.meta.totalPages ?? 1;
  const meta = users?.meta;
  render++;
  console.log("component  re-render", render, users);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => users?.items.map(({ id }) => id) || [],
    [users]
  );

  const table = useReactTable({
    data: users?.items ?? [],
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex w-full flex-col justify-start gap-6 px-4 lg:px-6">
      {/* <UsersFilter /> */}
      <div className="overflow-hidden rounded-lg border ">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="bg-white h-[529px]"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    // <DraggableRow key={row.id} row={row} />
                    <div key={row.id}>DraggableRow</div>
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {users?.meta.itemCount} of {users?.meta.totalItems} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${filters.limit}`}
              onValueChange={(value) => {
                // setFilters({ limit: Number(value) });
              }}
            >
              <SelectTrigger className="w-20" id="rows-per-page">
                <SelectValue placeholder={filters.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {meta?.currentPage} of {meta?.totalPages}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              // onClick={() => setFilters({ page: 1 })}
              disabled={currentPage <= 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              // onClick={() => setFilters({ page: (meta?.currentPage ?? 1) - 1 })}
              disabled={currentPage <= 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              // onClick={() => setFilters({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              // onClick={() => setFilters({ page: totalPages })}
              disabled={currentPage >= totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
