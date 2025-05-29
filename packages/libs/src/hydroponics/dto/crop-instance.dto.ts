export interface PlantType {
  id: number;
  slug: string;
  displayName: string;
  mediaFileId: string;
}

export interface CropInstance {
  id: number;
  deviceId: string;
  plantType: PlantType;
  plantTypeId: number;
  name: string;
  createdAt: string;
  isActive: boolean;
}
