"use client";
import { useEffect } from "react";
import isEqual from "lodash/isEqual";
import {
  useCameraQuery,
  useSensorsQuery,
} from "@adapter/hydroponics/hydroponics.hook.";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";

export default function SnapshotsSyncData() {
  const cameraData = useCameraQuery();
  const sensorData = useSensorsQuery();

  useEffect(() => {
    if (cameraData.isSuccess && cameraData) {
      const storeCamera = useHydroponicsStore.getState().camera;
      if (!isEqual(storeCamera, cameraData.data)) {
        useHydroponicsStore.setState({ camera: cameraData.data });
      }
    }
    if (sensorData.isSuccess && sensorData) {
      const storeSensors = useHydroponicsStore.getState().sensors;
      if (!isEqual(storeSensors, sensorData.data)) {
        useHydroponicsStore.setState({ sensors: sensorData.data });
      }
    }
  }, [cameraData, sensorData]);

  if (cameraData.isLoading) {
    return <>Camera Loading…</>;
  }
  if (sensorData.isLoading) {
    return <>Sensor Loading…</>;
  }
  if (cameraData.error) {
    return <>Error… {cameraData.error.message}</>;
  }
  if (sensorData.error) {
    return <>Error… {sensorData.error.message}</>;
  }

  return null;
}
