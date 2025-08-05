"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiService } from "./ai.service";
import { FeedbackAI } from "./dto/ai-feedback.type";

// Lấy toàn bộ lịch
export function useAiQuery() {
  return useQuery({
    queryKey: ["logsAi"],
    queryFn: () => aiService.getLogsAI(),
  });
}

// Cập nhật
export function useUpdateFeedbackAIMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: FeedbackAI }) =>
      aiService.updateFeedbackAI(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logsAi"] });
    },
  });
}
