"use client";
import { useEffect } from "react";
import isEqual from "lodash/isEqual";
import { usePlantTypeQuery } from "@adapter/plant-type/plant-type.hook.";
import { usePlantTypeStore } from "@adapter/plant-type/plant-type.store";

export default function PlantTypeSyncData() {
  const { isLoading, error, isSuccess, data } = usePlantTypeQuery();
  useEffect(() => {
    if (isSuccess && data) {
      const storeData = usePlantTypeStore.getState().data;
      if (!isEqual(storeData, data)) {
        usePlantTypeStore.setState({ data });
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
