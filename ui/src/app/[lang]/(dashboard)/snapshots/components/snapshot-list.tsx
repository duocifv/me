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
  const camera = useHydroponicsStore((s) => s.camera);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {$t`Snapshots Gallery`}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {camera &&
          camera.images.map((image, idx) => (
            <div
              key={idx}
              className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-[#293d84] bg-[#fffeec] shadow hover:shadow-lg transition"
            >
              <div className="h-40 w-full overflow-hidden">
                <Picture
                  src={image.url}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
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
