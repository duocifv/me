"use client";

import { useMutation } from "@tanstack/react-query";
import { medicalService } from "./medical.service";
import { useMedicalStore } from "./medical.store";

// Chuyển bullet list text thành mảng string
function parseBulletPoints(text?: string) {
  if (!text) return [];
  return text
    .split(/\n|•|-/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function useMedicalMutation() {
  const setResultsSteps = useMedicalStore((s) => s.setResultsSteps);

  return useMutation({
    mutationFn: (text: string) => medicalService.createMedalpaca(text),
    onSuccess: (data) => {
      if (!data) return;

      // Chuẩn hóa các trường text
      const cleanedData = {
        diagnosis: data.diagnosis?.trim() || "",
        severity: data.severity?.trim() || "",
        confidence_percent: Number(data.confidence_percent) || 0,
        explanation: data.explanation?.trim() || "",
        user_friendly_summary: data.user_friendly_summary?.trim() || "",
        management_advice: Array.isArray(data.management_advice)
          ? data.management_advice
          : parseBulletPoints(data.management_advice as string),
        red_flags: Array.isArray(data.red_flags)
          ? data.red_flags
          : parseBulletPoints(data.red_flags as string),
        confidence_level: data.confidence_level?.trim() || "",
      };

      // Lưu vào store
      setResultsSteps(cleanedData);
    },
  });
}
