export interface MediaVariants {
  thumbnail: string;
  medium: string;
  large: string;
}

export interface MediaFile {
  id: string;
  name: string | null;
  variants: MediaVariants;
  mimetype: string;
  labels: string[] | null;
  size: number;
  category: string | null;
  createdAt: string;
}

export interface PlantType {
  id: number;
  slug: string;
  displayName: string;
  mediaFileId: string;
  mediaFile: MediaFile;
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
