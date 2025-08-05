"use client";
import { useEffect } from "react";
import { useDeviceScheduleQuery } from "@/module/schedule/device.hook";
import { useDeviceScheduleStore } from "@adapter/schedule/device.store";

export default function ScheduleSyncData() {
  const { isLoading, error, data } = useDeviceScheduleQuery();
  useEffect(() => {
    if (data) {
      useDeviceScheduleStore.setState({ data });
    }
  }, [data]);

  if (isLoading) {
    return <>Loading…</>;
  }
  if (error) {
    return <>Error… {error.message}</>;
  }

  return null;
}
