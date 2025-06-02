
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Picture } from "@/components/share/picture/ui-picture";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";

export default function SnapshotsList() {
  const snapshots = useHydroponicsStore((s) => s.snapshots);
  const setSelectedSnapshotById = useHydroponicsStore(
    (s) => s.setSelectedSnapshotById
  );
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {snapshots.map((snapshot) => (
          <Card
            key={snapshot.id}
            className="overflow-hidden bg-white rounded-2xl shadow hover:shadow-lg transition transform hover:scale-[1.02]"
          >
            {snapshot?.images.length > 0 && (
              <Picture
                src={snapshot?.images[0].url ?? ""}
                className="h-48 w-full object-cover"
              />
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-green-800">
                {snapshot.isActive}
              </CardTitle>
              <p className="text-xs text-green-500 font-mono">
                timestamp: {snapshot.timestamp}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-4">
              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-100 rounded-full"
                  onClick={() => setSelectedSnapshotById(snapshot.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xem chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
