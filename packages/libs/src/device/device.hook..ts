"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { deviceConfigService } from "./device.service";
import { CreateDeviceConfigDto } from "./dto/create-device-config.dto";

export function useDeviceConfigQuery() {
  return useQuery({
    queryKey: ["deviceConfig"],
    queryFn: () => deviceConfigService.getByConfig(),
  });
}

export function useCreateDeviceConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDeviceConfigDto) =>
      deviceConfigService.createByConfig(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceConfig"] });
    },
  });
}
