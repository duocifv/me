"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { hydroponicsService } from "./hydroponics.service";
import { useHydroponicsStore } from "./hydroponics.store";

export function useHydroponicsQuery() {
  const setCropInstances = useHydroponicsStore((s) => s.setCropInstances);

  return useQuery({
    queryKey: ["cropInstances"],
    queryFn: async () => {
      const data = await hydroponicsService.getCropInstances();
      setCropInstances(data);
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useSnapshotsQuery() {
  const setSnapshots = useHydroponicsStore((s) => s.setSnapshots);

  return useQuery({
    queryKey: ["snapshots"],
    queryFn: async () => {
      const data = await hydroponicsService.getSnapshots();
      setSnapshots(data);
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useSnapshotByIdQuery(id: string) {
  return useQuery({
    queryKey: ["snapshot", id],
    queryFn: () => hydroponicsService.getByIdSnapshots(id),
    enabled: !!id,
  });
}
