import { JSX } from "react";
import symptomData from "../data/symptoms.json";

// Gán biểu tượng SVG cho từng hệ
export const systemInfoMap: Record<string, { Icon: JSX.Element }> = {
  "Hô hấp": {
    Icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-stethoscope-icon lucide-stethoscope"
      >
        <path d="M11 2v2" />
        <path d="M5 2v2" />
        <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
        <path d="M8 15a6 6 0 0 0 12 0v-3" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
  },

  "Tuần hoàn": {
    Icon: (
      <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21C12 21 5 13.5 5 8.5C5 5.42 7.42 3 10.5 3C12.24 3 13.91 3.81 15 5.08C16.09 3.81 17.76 3 19.5 3C22.58 3 25 5.42 25 8.5C25 13.5 18 21 18 21H12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Thần kinh": {
    Icon: (
      <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },

  "Tiêu hóa": {
    Icon: (
      <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 4V12C8 14 10 16 12 16C14 16 16 14 16 12V4M12 16V20"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Cơ xương khớp": {
    Icon: (
      <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 12L18 12M12 6L12 18"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Nội tiết": {
    Icon: (
      <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 12L16 12M12 8L12 16"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Niệu sinh dục": {
    Icon: (
      <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2V22M5 8L12 15L19 8"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Miễn dịch": {
    Icon: (
      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 6V12C3 17 6.5 21 12 22C17.5 21 21 17 21 12V6L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Toàn thân": {
    Icon: (
      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="4" r="2" fill="currentColor" />
        <path
          d="M12 6V20M6 10H18M6 10L9 20M18 10L15 20"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
};

type Symptom = {
  sign: string;
  description: string;
};

type AnatomicalPart = {
  anatomicalPart: string;
  clinicalSigns: Symptom[];
};

export type SystemData = {
  system: string;
  description: string;
  anatomicalParts: AnatomicalPart[];
};

export const typedSymptomData: SystemData[] = symptomData;
