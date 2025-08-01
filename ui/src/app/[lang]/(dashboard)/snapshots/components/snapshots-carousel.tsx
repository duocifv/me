"use client";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";
import { Picture } from "@/components/share/picture/ui-picture";
import { $t } from "@/app/lang";

export default function SnapsortCarousel() {
  const camera = useHydroponicsStore((s) => s.camera);

  return (
    <div className="px-4">
      <h3 className="mb-4 px-2 text-lg">{$t`Hình ảnh thu được`}</h3>
      <Carousel className="w-ful">
        <CarouselContent>
          {Array.isArray(camera) &&
            (camera?.slice(0, 5) ?? []).map((img, idx) => (
              <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <Picture src={img.url} className="h-96" />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
