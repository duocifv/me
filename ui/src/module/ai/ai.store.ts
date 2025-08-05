"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AiScheduleResponse } from "./dto/ai.type";

export interface AIState {
  data: AiScheduleResponse;
  setData: (data: AiScheduleResponse) => void;
}

export const useAIStore = create<AIState>()(
  devtools(
    immer((set) => ({
      data: [],
      setData: (data) => set({ data }),
    })),
    { name: "Ai" }
  )
);
