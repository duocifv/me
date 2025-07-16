"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { plantTypeService } from "./plant-type.service";
import { CreatePlantTypeDto } from "./dto/create-plant-type.dto";
import { UpdatePlantTypeDto } from "./dto/update-plant-type.dto";

export function usePlantTypeQuery() {
  return useQuery({
    queryKey: ["plantType"],
    queryFn: () => plantTypeService.getAll(),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePlantTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePlantTypeDto) => plantTypeService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantType"] });
    },
  });
}

export function useUpdatePlantTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdatePlantTypeDto }) =>
      plantTypeService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantType"] });
    },
  });
}

export function useRemoveUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => plantTypeService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantType"] });
    },
  });
}
