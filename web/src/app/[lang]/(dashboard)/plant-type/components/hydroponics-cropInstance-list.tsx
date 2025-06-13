// components/CropInstanceList.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Picture } from "@/components/share/picture/ui-picture";
import { usePlantTypeStore } from "@adapter/plant-type/plant-type.store";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";

export default function CropInstanceList() {
  const cropInstances = useHydroponicsStore((s) => s.cropInstances);
  const [dialogOpen, setDialogOpen] = useState(false);
  const data = usePlantTypeStore((s) => s.data);

  return (
    <section className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          🌿 Danh sách cây trồng
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Thêm cây</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>🌱 Chọn loại cây để thêm</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {data.map((plant) => (
                <Card
                  key={plant.id}
                  className="hover:shadow-md transition border-green-200"
                >
                  <CardContent className="p-4 space-y-3">
                    {plant?.mediaFile?.variants?.medium && (
                      <Picture
                        src={plant.mediaFile.variants.medium}
                        alt={plant.displayName}
                        className="h-40 w-full object-cover rounded-md border"
                      />
                    )}
                    <h4 className="text-lg font-semibold text-green-700 text-center">
                      {plant.displayName}
                    </h4>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => console.log("Chọn plant:", plant)}
                    >
                      🌿 Gieo cây này
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cropInstances.map((crop) => (
          <Card
            key={crop.id}
            className="hover:shadow-md transition-all rounded-2xl border-gray-200"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Picture
                  src={crop.plantType.mediaFileId}
                  alt={crop.name}
                  className="w-16 h-16 rounded-xl object-cover border"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {crop.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {crop.plantType.displayName}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-700">
                <p>
                  <span className="text-gray-500">Thiết bị:</span>{" "}
                  {crop.deviceId}
                </p>
                <p>
                  <span className="text-gray-500">Ngày tạo:</span>{" "}
                  {new Date(crop.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Badge
                  variant={crop.isActive ? "default" : "outline"}
                  className={
                    crop.isActive ? "bg-green-500" : "bg-gray-300 text-gray-700"
                  }
                >
                  {crop.isActive ? "Đang hoạt động" : "Không hoạt động"}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => console}>
                  Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
