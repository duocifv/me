"use client";
import { useEffect } from "react";
import isEqual from "lodash/isEqual";
import { useDeviceConfigStore } from "@/module/device/device.store";
import { useDeviceGeminiQuery } from "@/module/device/device.hook.";

export default function GeminiSyncData() {
  const { isLoading, error, isSuccess, data } = useDeviceGeminiQuery();
  useEffect(() => {
    if (isSuccess && data) {
      const storeData = useDeviceConfigStore.getState().gemini;
      if (!isEqual(storeData, data)) {
        useDeviceConfigStore.setState({ gemini: data });
      }
    }
  }, [data, isSuccess]);

  if (isLoading) {
    return <>Loading…</>;
  }
  if (error) {
    return <>Error… {error.message}</>;
  }

  return null;
}
