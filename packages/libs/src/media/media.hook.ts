"use client";

import { useQuery } from "@tanstack/react-query";
import { mediaService } from "./media.service";

export function useMediaQuery() {
  return useQuery({
    queryKey: ["media"],
    queryFn: () => mediaService.findAll(),
  });
}
