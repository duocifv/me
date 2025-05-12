import React, { Suspense } from "react";
import ImageLibrary from "@/components/MediaLibrary";
import { SiteHeader } from "@/components/site-header";
import { MediaSummary } from "@/components/MediaSummary";

export default function MediaImagesPage() {
  return (
    <Suspense>
      <SiteHeader value="Media Library" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <MediaSummary />
            <ImageLibrary />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
