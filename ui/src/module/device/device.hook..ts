"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceConfigService } from "./device.service";
import { DeviceControlDto } from "./dto/device-control.dto";
import { deviceScheduleService } from "../schedule/device.service";
import { UpdateScheduleDto } from "../schedule/dto/update-schedule.type";

export function useDeviceConfigQuery() {
  return useQuery({
    queryKey: ["deviceConfig"],
    queryFn: () => deviceConfigService.getByConfig(),
  });
}

// Cập nhật
export function useUpdateConfigScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateScheduleDto }) =>
      deviceScheduleService.updateSchedule(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceConfig"] });
    },
  });
}

export function useDeviceErrorQuery() {
  return useQuery({
    queryKey: ["deviceError"],
    queryFn: () => deviceConfigService.getError(),
  });
}

export function useDeviceGeminiQuery() {
  return useQuery({
    queryKey: ["deviceGemini"],
    queryFn: () => deviceConfigService.getGemini(),
  });
}

export function useSensorsQuery() {
  return useQuery({
    queryKey: ["sensors"],
    queryFn: () => deviceConfigService.getSensors(),
  });
}

export function useCreateDeviceConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: DeviceControlDto) =>
      deviceConfigService.createByConfig(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceConfig"] });
    },
  });
}
