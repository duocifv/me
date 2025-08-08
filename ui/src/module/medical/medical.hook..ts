"use client";

import { useMutation } from "@tanstack/react-query";
import { medicalService } from "./medical.service";

export function useMedicalMutation() {
  return useMutation({
    mutationFn: (text: string) => medicalService.createMedalpaca(text),
  });
}
