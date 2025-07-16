"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceScheduleService } from "./device.service";
import { DeviceScheduleDto } from "./dto/device-schedule.dto";

// Lấy toàn bộ lịch
export function useDeviceScheduleQuery() {
  return useQuery({
    queryKey: ["deviceSchedule"],
    queryFn: () => deviceScheduleService.getSchedules(),
  });
}

// Lấy 1 lịch theo ID
export function useDeviceScheduleDetailQuery(id: number) {
  return useQuery({
    queryKey: ["deviceSchedule", id],
    queryFn: () => deviceScheduleService.getSchedule(id),
    enabled: !!id, // không gọi nếu id là undefined/null
  });
}

// Tạo mới
export function useCreateDeviceScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: DeviceScheduleDto) =>
      deviceScheduleService.createSchedule(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceSchedule"] });
    },
  });
}

// Cập nhật
export function useUpdateDeviceScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: DeviceScheduleDto }) =>
      deviceScheduleService.updateSchedule(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deviceSchedule"] });
      queryClient.invalidateQueries({
        queryKey: ["deviceSchedule", variables.id],
      });
    },
  });
}

// Xoá
export function useDeleteDeviceScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deviceScheduleService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceSchedule"] });
    },
  });
}
