"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  DetailedSymptoms,
  MedicalHistory,
  PatientInfo,
  UserFriendlyAnalysisDto,
} from "./medical.type";

export interface MedicalState {
  detailedSymptoms: DetailedSymptoms;
  patientInfo: PatientInfo;
  medicalHistory: MedicalHistory;
  basicSymptoms: string[];
  resultsStep: UserFriendlyAnalysisDto;
  setDetailedSymptoms: (data: DetailedSymptoms) => void;
  setPatientInfo: (data: PatientInfo) => void;
  setMedicalHistory: (data: MedicalHistory) => void;
  setBasicSymptoms: (data: string[]) => void;
  setResultsSteps: (data: UserFriendlyAnalysisDto) => void;
}

export const useMedicalStore = create<MedicalState>()(
  devtools(
    immer((set) => ({
      detailedSymptoms: {
        painIntensity: "",
        painDuration: "",
        painLocation: "",
        associatedSymptoms: [],
        aggravatingFactors: [],
        relievingFactors: [],
      },
      patientInfo: {
        fullName: "",
        age: "",
        gender: "",
        weight: "",
        height: "",
        phone: "",
      },
      medicalHistory: {
        chronicConditions: [],
        allergies: "",
        currentMedications: "",
        previousSurgeries: "",
        familyHistory: [],
      },
      basicSymptoms: [],
      resultsStep: {
        explanation: "",
        user_friendly_summary: "",
        management_advice: "",
        red_flags: "",
        confidence_level: "",
        diagnosis: "",
        severity: "",
        confidence_percent: 0,
      },
      setDetailedSymptoms: (detailedSymptoms) => set({ detailedSymptoms }),
      setPatientInfo: (patientInfo) => set({ patientInfo }),
      setMedicalHistory: (medicalHistory) => set({ medicalHistory }),
      setBasicSymptoms: (basicSymptoms) => set({ basicSymptoms }),
      setResultsSteps: (resultsStep) => set({ resultsStep }),
    })),
    { name: "DeviceConfigStore" }
  )
);
