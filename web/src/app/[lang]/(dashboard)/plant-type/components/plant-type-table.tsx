"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { usePlantTypeStore } from "@adapter/plant-type/plant-type.store";
import { Picture } from "@/components/share/picture/ui-picture";
import UpdatePlantTypeSheet from "../dispatch/dispatch-plant-type-update";
import ButtonPlantTypeDelete from "../dispatch/dispatch-plant-type-delete-one";

export default function PlantTypeList() {
  const data = usePlantTypeStore((s) => s.data);
  const setSelectedPlantId = usePlantTypeStore((s) => s.setSelectedPlantId);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((plant) => (
          <Card
            key={plant.id}
            className="overflow-hidden bg-white rounded-2xl shadow hover:shadow-lg transition transform hover:scale-[1.02]"
          >
            {plant?.mediaFile?.variants?.medium && (
              <Picture
                src={plant?.mediaFile?.variants?.medium}
                className="h-48 w-full object-cover"
              />
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-green-800">
                {plant.displayName}
              </CardTitle>
              <p className="text-xs text-green-500 font-mono">
                slug: {plant.slug}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-4">
              <div className="flex gap-3">
                <UpdatePlantTypeSheet plant={plant} />
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-100 rounded-full"
                  onClick={() => setSelectedPlantId(plant.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Xử lý dialog xóa */}
      <ButtonPlantTypeDelete />
    </div>
  );
}
