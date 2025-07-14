// hydroponics.hook.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { hydroponicsService } from "./hydroponics.service";
import { useHydroponicsStore } from "./hydroponics.store";

export function useCropInstancesQuery() {
  const setCropInstances = useHydroponicsStore((s) => s.setCropInstances);

  return useQuery({
    queryKey: ["cropInstances"],
    queryFn: async () => {
      const data = await hydroponicsService.getCropInstances();
      setCropInstances(data);
      return data;
    },
  });
}

export function useSnapshotsQuery(page = 1, limit = 10) {
  const setSnapshots = useHydroponicsStore((s) => s.setSnapshots);

  return useQuery({
    queryKey: ["snapshots", "device-001", page, limit],
    queryFn: async () => {
      const data = await hydroponicsService.getSnapshots(page, limit);
      setSnapshots(data);
      return data;
    },
  });
}

export function useSnapshotByIdQuery(id: string) {
  return useQuery({
    queryKey: ["snapshot", id],
    queryFn: () => hydroponicsService.getByIdSnapshots(id),
    enabled: !!id,
  });
}
