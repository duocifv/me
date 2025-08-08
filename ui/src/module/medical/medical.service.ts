import { api } from "../share/api/apiClient";

class MedicalService {
  private device = api.group("ai");

  async createMedalpaca(text: string): Promise<{ text: string }> {
    return this.device.post(
      "medalpaca",
      { text },
      {
        timeout: 30000,
      }
    );
  }
}

export const medicalService = new MedicalService();
