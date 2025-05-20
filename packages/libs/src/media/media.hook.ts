"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { mediaService } from "./media.service";
import { useMediaStore } from "./media.store";
import { FileType } from "./dto/media-upload.dto";

export function useMediaQuery() {
  return useQuery({
    queryKey: ["media"],
    queryFn: () => mediaService.findAll(),
  });
}

export function useMediaMutation() {
  const file = useMediaStore((s) => s.file);
  return useMutation({
    mutationFn: () => mediaService.upload(file as FileType),
  });
}
