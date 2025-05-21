"use client";
import React, { Suspense } from "react";
import { MediaSummary } from "@/app/[lang]/(dashboard)/media/components/media-summary";
import ImageLibrary from "@/app/[lang]/(dashboard)/media/components/media-library";
import dynamic from "next/dynamic";
import AppLoading from "../components/app-loading";

const MediaSyncData = dynamic(
  () => import("./dispatch/dispatch-media-sync-data"),
  {
    loading: () => <AppLoading />,
  }
);

export default function MediaImagesPage() {
  return (
    <Suspense>
      <MediaSyncData />
      <MediaSummary />
      <ImageLibrary />
    </Suspense>
  );
}
