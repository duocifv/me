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

export function SnapsortCarousel() {
  const snapshots = useHydroponicsStore((s) => s.snapshots);
  return (
    <div className="px-4">
      <h3 className="mb-4 px-2 text-lg">{$t`Hình ảnh thu được`}</h3>
      <Carousel className="w-ful">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, idx) => (
            <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 ">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-4xl font-semibold">
                      <Picture
                        src={snapshots.items[idx]?.images[0]?.filePath ?? ""}
                        className="h-96"
                      />
                    </span>
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
