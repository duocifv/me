// hydroponics.service.ts
import { api } from "../share/api/apiClient";
import { CropInstance } from "./dto_/crop-instance.dto";
import { Snapshot, SnapshotResponse } from "./dto/snapshot.dto";
import { CameraSnapshot, SensorSnapshot } from "./dto/snap.dto";

class HydroponicsService {
  private hydroponics = api.group("");

  async getCropInstances(): Promise<CropInstance[]> {
    return this.hydroponics.get<CropInstance[]>("hydroponics/crop-instances");
  }

  async getSensors(): Promise<SensorSnapshot> {
    return this.hydroponics.get<SensorSnapshot>("mqtt/sensors");
  }

  async getCamera(): Promise<CameraSnapshot> {
    return this.hydroponics.get<CameraSnapshot>("mqtt/camera");
  }

  async getSnapshots(page = 1, limit = 30): Promise<SnapshotResponse> {
    return this.hydroponics.get<SnapshotResponse>(
      "hydroponics/snapshots/by-device",
      {
        deviceId: "device-001",
        page,
        limit,
      }
    );
  }

  async getByIdSnapshots(id: string): Promise<Snapshot> {
    return this.hydroponics.get<Snapshot>(`hydroponics/snapshots/${id}`);
  }
}

export const hydroponicsService = new HydroponicsService();
