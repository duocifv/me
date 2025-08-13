export interface DetailedSymptoms {
  painIntensity: string;
  painDuration: string;
  painLocation: string;
  associatedSymptoms: string[];
  aggravatingFactors: string[];
  relievingFactors: string[];
}

export interface MedicalHistory {
  chronicConditions: string[];
  allergies: string;
  currentMedications: string;
  previousSurgeries: string;
  familyHistory: string[];
}

export interface PatientInfo {
  fullName: string;
  age: string;
  gender: "Nam" | "Nữ" | "Khác" | "";
  weight?: string;
  height?: string;
  phone?: string;
  email?: string;
}

export interface UserFriendlyAnalysisDto {
  diagnosis: string;
  severity: string;
  confidence_percent: number;
  explanation: string;
  user_friendly_summary: string;
  management_advice: string | string[];
  red_flags: string | string[];
  confidence_level: string;
}
