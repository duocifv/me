import React, { Suspense } from "react";
import { MediaSummary } from "@/app/[lang]/(dashboard)/media/components/media-summary";
import ImageLibrary from "@/app/[lang]/(dashboard)/media/components/media-library";
import dynamic from "next/dynamic";
import AppLoading from "../components/app-loading";

const MediaLoader = dynamic(() => import("./components/media-loader"), {
  loading: () => <AppLoading />,
});

export default function MediaImagesPage() {
  return (
    <Suspense>
      <MediaLoader />
      <MediaSummary />
      <ImageLibrary />
    </Suspense>
  );
}
