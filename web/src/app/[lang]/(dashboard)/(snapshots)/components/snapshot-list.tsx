"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";
import { format } from "date-fns";
import { Picture } from "@/components/share/picture/ui-picture";
import { $t } from "@/app/lang";

export default function SnapshotsListSimple() {
  const snapshots = useHydroponicsStore((s) => s.snapshots);
  const setSelectedSnapshotById = useHydroponicsStore(
    (s) => s.setSelectedSnapshotById
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {$t`Snapshots List`}
      </h1>
      <ul className="space-y-4 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {snapshots.map((snapshot) => (
          <li
            key={snapshot.id}
            className="bg-[#fffeec] rounded-xl shadow p-3 flex justify-between items-center hover:shadow-md transition cursor-pointer relative border-2 border-[#293d84]"
            onClick={() => setSelectedSnapshotById(snapshot.id)}
          >
            <div className="min-w-24">
              {snapshot.images.length > 0 ? (
                <Picture
                  src={snapshot.images[0].url}
                  className="h-20 w-full object-cover rounded-t-xl"
                />
              ) : (
                <div className="h-20 w-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-md">
                  {$t`No Image`}
                </div>
              )}
            </div>
            <div className="w-full ml-4">
              <div className="absolute right-4 top-4">
                <Badge
                  variant={snapshot.isActive ? "default" : "secondary"}
                  className={`text-xs bg-[#e43eb5] border-2 border-[#293d84] rounded-full ${
                    snapshot.isActive ? "bg-[#e43eb5] text-[#faf0bc]" : ""
                  }`}
                >
                  {snapshot.isActive ? $t`Active` : $t`Inactive`}
                </Badge>
              </div>
              <h2 className="text-lg font-semibold text-[#293d84]">
                {$t`Snapshot #`}
                {snapshot.id}
              </h2>

              <div className="flex items-center space-x-4 mt-1">
                <span className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {format(new Date(snapshot.timestamp), "dd MMM yyyy, HH:mm")}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
