"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "./media.service";
import { useMediaStore } from "./media.store";
import { FileType } from "./dto/media-upload.dto";
import { BulkDeleteDto } from "../auth/dto/bulk-delete.dto";

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

export function useMediaDeleteOneMutation() {
  return useMutation({
    mutationFn: (id: string) => mediaService.deleteOne(id),
  });
}

export function useMediaDeleteManyMutation() {
  const refresh = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkDeleteDto) => mediaService.deleteMany(dto),
    onSuccess: () => {
      refresh.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useMediaDownloadMutation() {
  return useMutation({
    mutationFn: (fileName: string) => mediaService.downloadFile(fileName),
  });
}
