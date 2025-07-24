"use client";

import * as React from "react";
// import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";
import { format } from "date-fns";
import { Picture } from "@/components/share/picture/ui-picture";
import { $t } from "@/app/lang";
import { SnapshotPagination } from "./snapshot-pagination";

export default function SnapshotsListGallery() {
  const { snapshots } = useHydroponicsStore((s) => s);
  const setSelectedSnapshotById = useHydroponicsStore(
    (s) => s.setSelectedSnapshotById
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {$t`Snapshots Gallery`}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {snapshots.items.map((snapshot) => (
          <div
            key={snapshot.id}
            className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-[#293d84] bg-[#fffeec] shadow hover:shadow-lg transition"
            onClick={() => setSelectedSnapshotById(snapshot.id)}
          >
            <div className="h-40 w-full overflow-hidden">
              {snapshot.images.length > 0 ? (
                <Picture
                  src={`/uploads/esp32/${snapshot.images[0].filePath}`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                  {$t`No Image`}
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#293d84]">
                  {$t`#`}
                  {snapshot.id}
                </h2>
                {/* <Badge
                  variant={snapshot.isActive ? "default" : "secondary"}
                  className={`rounded-full border-2 border-[#293d84] px-2 py-1 text-xs ${
                    snapshot.isActive ? "bg-[#e43eb5] text-[#faf0bc]" : ""
                  }`}
                >
                  {snapshot.isActive ? $t`Active` : $t`Inactive`}
                </Badge> */}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {format(new Date(snapshot.createdAt), "dd MMM yyyy, HH:mm")}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <SnapshotPagination />
      </div>
    </div>
  );
}
