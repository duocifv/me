import { api } from "../share/api/apiClient";
import { CropInstance } from "./dto/crop-instance.dto";
import { Snapshot } from "./dto/snapshot.dto";

class HydroponicsService {
  private hydroponics = api.group("hydroponics");

  async getCropInstances(): Promise<CropInstance[]> {
    return await this.hydroponics.get<CropInstance[]>("crop-instances");
  }
  async getSnapshots(): Promise<Snapshot[]> {
    return await this.hydroponics.get<Snapshot[]>("snapshots");
  }

  async getByIdSnapshots(id: string): Promise<Snapshot> {
    return this.hydroponics.get<Snapshot>(`snapshots/${id}`);
  }
}

export const hydroponicsService = new HydroponicsService();
