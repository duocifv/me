import React, { Suspense } from "react";
import ImageLibrary from "@/components/MediaLibrary";
import { MediaSummary } from "@/components/MediaSummary";

export default function MediaImagesPage() {
  return (
    <Suspense>
      <MediaSummary />
      <ImageLibrary />
    </Suspense>
  );
}
