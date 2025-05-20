"use client";
import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { Picture } from "@/components/share/picture/ui-picture";
import { useState } from "react";
import { useMediaStore } from "@adapter/media/media.store";
import { MediaFile } from "@adapter/media/dto/media-pagination";

export const columns: ColumnDef<MediaFile>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function ImageManager() {
  const [rowSelection, setRowSelection] = useState({});
  const medias = useMediaStore((s) => s.data);
  const table = useReactTable({
    data: medias.items,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const file = row.original;
            return (
              <div
                key={row.id}
                className={`border rounded-lg overflow-hidden shadow-sm flex flex-col relative ${
                  row.getIsSelected() ? "ring-2 ring-emerald-400" : "bg-white"
                }`}
              >
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  className="absolute top-2 left-2 z-10 cursor-pointer"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Picture
                      src={file.variants.thumbnail}
                      className="w-full cursor-zoom-in"
                    />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-left">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </DialogTitle>
                      <DialogDescription>
                        <Picture
                          src={file.variants.large}
                          className="w-full h-auto"
                        />
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600 flex items-center">
                      <span className="text-xs text-gray-500 pr-3">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div>
                          <MoreVerticalIcon size={16} />
                          <span className="sr-only">Open menu</span>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No images found.
          </div>
        )}
      </div>
    </>
  );
}
