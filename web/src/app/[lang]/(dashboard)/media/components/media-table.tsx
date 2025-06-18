"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useMediaStore } from "@adapter/media/media.store";
import { MediaFile } from "@adapter/media/dto/media-pagination";
import MediaAction from "./media-action";
import { $t } from "@/app/lang";

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
        aria-label={$t`Chọn tất cả`}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={$t`Chọn hàng`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export function ImageManager() {
  const fileIds = useMediaStore((s) => s.fileIds);
  const setFileIds = useMediaStore((s) => s.setFileIds);
  const medias = useMediaStore((s) => s.data);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {medias.items.length ? (
        medias.items.map((file) => {
          const isActive = fileIds.includes(file.id);
          return (
            <div
              key={file.id}
              className={`border rounded-lg overflow-hidden shadow-sm flex flex-col relative ${
                isActive ? "ring-2 ring-emerald-400" : "bg-white"
              }`}
            >
              <Checkbox
                checked={isActive}
                onCheckedChange={() => setFileIds(file.id)}
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
                  <MediaAction {...file} />
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center text-gray-500 py-10">
          {$t`Không tìm thấy hình ảnh nào.`}
        </div>
      )}
    </div>
  );
}
