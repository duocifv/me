import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CropInstance } from '../entities/crop-instance.entity';
import { PlantType } from '../../plant-type/entity/plant-type.entity';
import { Snapshot } from '../entities/snapshot.entity';
import { CameraImage } from '../entities/camera-image.entity';
import { CreateCropInstanceDto } from '../dto/create-crop-instance.dto';
import { CreateSnapshotDto } from '../dto/create-snapshot.dto';

@Injectable()
export class HydroponicsService {
  constructor(
    @InjectRepository(CropInstance)
    private readonly cropRepo: Repository<CropInstance>,
    @InjectRepository(PlantType)
    private readonly plantTypeRepo: Repository<PlantType>,
    @InjectRepository(Snapshot)
    private readonly snapRepo: Repository<Snapshot>,
    @InjectRepository(CameraImage)
    private readonly imgRepo: Repository<CameraImage>,
  ) {}

  /** Tạo CropInstance bằng deviceId và plantTypeId */
  async createCropInstance(deviceId: string, dto: CreateCropInstanceDto) {
    const plantType = await this.plantTypeRepo.findOne({
      where: { id: dto.plantTypeId },
    });

    if (!plantType) throw new NotFoundException('PlantType not found');

    const crop = this.cropRepo.create({
      name: dto.name,
      plantType,
      deviceId,
    });

    return await this.cropRepo.save(crop);
  }

  /** Lấy danh sách crop của một thiết bị */
  async getCropInstances(deviceId: string) {
    return await this.cropRepo.find({
      where: { deviceId },
      relations: ['plantType'],
    });
  }

  /** Tạo snapshot gắn với cropId */
  async createSnapshot(cropId: number, dto: CreateSnapshotDto) {
    const crop = await this.cropRepo.findOne({ where: { id: cropId } });
    if (!crop) throw new NotFoundException('CropInstance not found');

    const snap = this.snapRepo.create({
      cropInstance: crop,
      sensorData: dto.sensorData,
      solutionData: dto.solutionData,
    });

    return await this.snapRepo.save(snap);
  }

  /** Lấy toàn bộ snapshots của một crop */
  async getSnapshots(cropId: number) {
    return await this.snapRepo.find({
      where: { cropInstance: { id: cropId } },
      relations: ['images'],
    });
  }

  /** Lấy chi tiết một snapshot */
  async getSnapshotById(snapshotId: number) {
    const snap = await this.snapRepo.findOne({
      where: { id: snapshotId },
      relations: ['images'],
    });
    if (!snap) throw new NotFoundException('Snapshot not found');
    return snap;
  }

  /** Gắn ảnh vào snapshot */
  async uploadImage(snapshotId: number, url: string) {
    const snap = await this.snapRepo.findOne({ where: { id: snapshotId } });
    if (!snap) throw new NotFoundException('Snapshot not found');

    const img = this.imgRepo.create({
      snapshot: snap,
      url,
    });

    return await this.imgRepo.save(img);
  }
}
