"use client";
import { useEffect } from "react";
import isEqual from "lodash/isEqual";
import { useDeviceScheduleQuery } from "@/module/schedule/device.hook";
import { useDeviceScheduleStore } from "@adapter/schedule/device.store";

export default function ScheduleSyncData() {
  const { isLoading, error, isSuccess, data } = useDeviceScheduleQuery();
  useEffect(() => {
    if (isSuccess && data) {
      const storeData = useDeviceScheduleStore.getState().data;
      if (!isEqual(storeData, data)) {
        useDeviceScheduleStore.setState({ data });
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
