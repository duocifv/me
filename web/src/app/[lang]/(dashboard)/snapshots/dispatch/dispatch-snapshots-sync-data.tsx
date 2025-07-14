"use client";
import { useEffect } from "react";
import isEqual from "lodash/isEqual";
import { useSnapshotsQuery } from "@adapter/hydroponics/hydroponics.hook.";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";

export default function SnapshotsSyncData() {
  const { page, limit } = useHydroponicsStore((s) => s.filters);
  const {
    isLoading,
    error,
    isSuccess,
    data: snapshots,
  } = useSnapshotsQuery(page, limit);
  useEffect(() => {
    if (isSuccess && snapshots) {
      const storeData = useHydroponicsStore.getState().snapshots;
      if (!isEqual(storeData, snapshots)) {
        useHydroponicsStore.setState({ snapshots });
      }
    }
  }, [snapshots, isSuccess]);

  if (isLoading) {
    return <>Loading…</>;
  }
  if (error) {
    return <>Error… {error.message}</>;
  }

  return null;
}
