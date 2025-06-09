import { api } from "../share/api/apiClient";
import { CropInstance } from "./dto_/crop-instance.dto";
import { Snapshot, SnapshotResponse } from "./dto/snapshot.dto";

class HydroponicsService {
  private hydroponics = api.group("hydroponics");

  async getCropInstances(): Promise<CropInstance[]> {
    return await this.hydroponics.get<CropInstance[]>("crop-instances");
  }

  async getSnapshots(deviceId: string): Promise<SnapshotResponse> {
    return this.hydroponics.get<SnapshotResponse>("snapshots/by-device", {
      deviceId,
    });
  }

  async getByIdSnapshots(id: string): Promise<Snapshot> {
    const data = this.hydroponics.get<Snapshot>(`snapshots/${id}`);
    return data;
  }
}

export const hydroponicsService = new HydroponicsService();
