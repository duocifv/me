// hydroponics.service.ts
import { api } from "../share/api/apiClient";
import { CropInstance } from "./dto_/crop-instance.dto";
import { Snapshot, SnapshotResponse } from "./dto/snapshot.dto";

class HydroponicsService {
  private hydroponics = api.group("hydroponics");

  async getCropInstances(): Promise<CropInstance[]> {
    return this.hydroponics.get<CropInstance[]>("crop-instances");
  }

  async getSnapshots(page = 1, limit = 10): Promise<SnapshotResponse> {
    return this.hydroponics.get<SnapshotResponse>("snapshots/by-device", {
      deviceId: "device-001",
      page,
      limit,
    });
  }

  async getByIdSnapshots(id: string): Promise<Snapshot> {
    return this.hydroponics.get<Snapshot>(`snapshots/${id}`);
  }
}

export const hydroponicsService = new HydroponicsService();
