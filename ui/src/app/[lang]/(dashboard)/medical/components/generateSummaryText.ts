import { MedicalHistory, PatientInfo } from "@/module/medical/medical.type";
import { DetailedSymptoms } from "./ConfirmationStep";

export function generateSummaryText(
  patientInfo: PatientInfo,
  basicSymptoms: string[],
  detailedSymptoms: DetailedSymptoms,
  medicalHistory: MedicalHistory
): string {
  return `
Thông tin bệnh nhân:
- Họ và tên: ${patientInfo.fullName || "Không rõ"}
- Tuổi: ${patientInfo.age ? patientInfo.age + " tuổi" : "Không rõ"}
- Giới tính: ${patientInfo.gender || "Không rõ"}
- Cân nặng: ${patientInfo.weight || "Không rõ"} kg
- Chiều cao: ${patientInfo.height || "Không rõ"} cm

Triệu chứng cơ bản:
- ${basicSymptoms.length > 0 ? basicSymptoms.join(", ") : "Không rõ"}

Triệu chứng chi tiết:
- Mức độ đau: ${
    detailedSymptoms?.painIntensity
      ? detailedSymptoms.painIntensity + "/10"
      : "Không rõ"
  }/
- Thời gian xuất hiện: ${detailedSymptoms.painDuration || "Không rõ"}
- Vị trí đau: ${detailedSymptoms.painLocation || "Không rõ"}
- Triệu chứng kèm theo: ${
    detailedSymptoms.associatedSymptoms.length > 0
      ? detailedSymptoms.associatedSymptoms.join(", ")
      : "Không rõ"
  }
- Yếu tố làm tăng đau: ${
    detailedSymptoms.aggravatingFactors.length > 0
      ? detailedSymptoms.aggravatingFactors.join(", ")
      : "Không rõ"
  }
- Yếu tố làm giảm đau: ${
    detailedSymptoms.relievingFactors.length > 0
      ? detailedSymptoms.relievingFactors.join(", ")
      : "Không rõ"
  }

Tiền sử y khoa:
- Bệnh mãn tính: ${
    medicalHistory.chronicConditions.length > 0
      ? medicalHistory.chronicConditions.join(", ")
      : "Không rõ"
  }
- Dị ứng: ${medicalHistory.allergies || "Không rõ"}
- Thuốc đang dùng: ${medicalHistory.currentMedications || "Không rõ"}
- Tiền sử phẫu thuật: ${medicalHistory.previousSurgeries || "Không rõ"}
- Tiền sử gia đình: ${
    medicalHistory.familyHistory.length > 0
      ? medicalHistory.familyHistory.join(", ")
      : "Không rõ"
  }
`.trim();
}
