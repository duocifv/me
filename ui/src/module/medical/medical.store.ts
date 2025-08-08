"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { DetailedSymptoms, MedicalHistory, PatientInfo } from "./medical.type";

export interface MedicalState {
  detailedSymptoms: DetailedSymptoms;
  patientInfo: PatientInfo;
  medicalHistory: MedicalHistory;
  basicSymptoms: string[];
  setDetailedSymptoms: (data: DetailedSymptoms) => void;
  setPatientInfo: (data: PatientInfo) => void;
  setMedicalHistory: (data: MedicalHistory) => void;
  setBasicSymptoms: (data: string[]) => void;
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
      setDetailedSymptoms: (detailedSymptoms) => set({ detailedSymptoms }),
      setPatientInfo: (patientInfo) => set({ patientInfo }),
      setMedicalHistory: (medicalHistory) => set({ medicalHistory }),
      setBasicSymptoms: (basicSymptoms) => set({ basicSymptoms }),
    })),
    { name: "DeviceConfigStore" }
  )
);
