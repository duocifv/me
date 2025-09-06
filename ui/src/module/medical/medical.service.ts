import { api } from "../share/api/apiClient";
import { UserFriendlyAnalysisDto } from "./medical.type";

class MedicalService {
  private device = api.group("ai");

  async createMedalpaca(text: string): Promise<UserFriendlyAnalysisDto> {
    return this.device.post<UserFriendlyAnalysisDto>(
      "medalpaca",
      { text },
      {
        timeout: 1200000,
      }
    );
  }
}
export const medicalService = new MedicalService();
