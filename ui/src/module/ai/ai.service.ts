// src/adapter/schedule/device-schedule.service.ts
import { api } from "../share/api/apiClient";
import { FeedbackAI } from "./dto/ai-feedback.type";
import { AiScheduleResponse } from "./dto/ai.type";

class AIService {
  private device = api.group("ai");

  async getLogsAI(): Promise<AiScheduleResponse> {
    return this.device.get<AiScheduleResponse>(`logs`);
  }

  async updateFeedbackAI(id: number, dto: FeedbackAI) {
    return this.device.put<FeedbackAI>(`${id}/reward`, dto);
  }
}

export const aiService = new AIService();
