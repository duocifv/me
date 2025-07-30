"use client";

import { useSensorsQuery } from "@/module/device/device.hook.";
import { useDeviceConfigStore } from "@/module/device/device.store";
import { isEqual } from "lodash";
import { useEffect } from "react";

export default function SensorsSyncData() {
  const { isLoading, error, isSuccess, data: sensors } = useSensorsQuery();
  useEffect(() => {
    if (isSuccess && sensors) {
      const storeData = useDeviceConfigStore.getState().sensors;
      if (!isEqual(storeData, sensors)) {
        useDeviceConfigStore.setState({ sensors });
      }
    }
  }, [sensors, isSuccess]);

  if (isLoading) {
    return <div>Loading…</div>;
  }
  if (error) {
    return <>Error… {error.message}</>;
  }

  return null;
}
