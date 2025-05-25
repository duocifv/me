import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCropInstanceDto } from '../dto/create-crop-instance.dto';
import { CreateSnapshotDto } from '../dto/create-snapshot.dto';
import { CropInstance } from '../entities/crop-instance.entity';
import { Snapshot } from '../entities/snapshot.entity';
import { CameraImage } from '../entities/camera-image.entity';

@Injectable()
export class HydroponicsService {
  constructor(
    @InjectRepository(CropInstance)
    private readonly cropRepo: Repository<CropInstance>,
    @InjectRepository(Snapshot)
    private readonly snapRepo: Repository<Snapshot>,
    @InjectRepository(CameraImage)
    private readonly imgRepo: Repository<CameraImage>,
  ) {}

  /**
   * Tạo crop instance mới, set active=true, deactivate crop cũ
   */
  async createCropInstance(
    deviceId: string,
    dto: CreateCropInstanceDto,
  ): Promise<CropInstance> {
    await this.cropRepo.update({ deviceId, isActive: true }, { isActive: false });
    const crop = this.cropRepo.create({
      deviceId,
      plantTypeId: dto.plantTypeId,
      name: dto.name,
      isActive: true,
    });
    return this.cropRepo.save(crop);
  }

  /**
   * Lấy tất cả crop instances của device
   */
  async getCropInstances(deviceId: string): Promise<CropInstance[]> {
    return this.cropRepo.find({
      where: { deviceId },
      relations: ['plantType'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Tạo snapshot mới cho crop active
   */
  async createSnapshot(
    deviceId: string,
    dto: CreateSnapshotDto,
  ): Promise<Snapshot> {
    const crop = await this.cropRepo.findOne({
      where: { deviceId, isActive: true },
    });
    if (!crop) {
      throw new NotFoundException('Không tìm thấy crop active');
    }

    const snapshot = this.snapRepo.create({
      cropInstanceId: crop.id,
      sensorData: dto.sensorData,
      solutionData: dto.solutionData,
    });
    return this.snapRepo.save(snapshot);
  }

  /**
   * Lấy tất cả snapshots của crop active
   */
  async getSnapshotsByDevice(deviceId: string): Promise<Snapshot[]> {
    const crop = await this.cropRepo.findOne({
      where: { deviceId, isActive: true },
    });
    if (!crop) {
      throw new NotFoundException('Không tìm thấy crop active');
    }

    return this.snapRepo.find({
      where: { cropInstanceId: crop.id },
      relations: ['images'],
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Lấy chi tiết snapshot theo ID
   */
  async getSnapshotById(snapshotId: number): Promise<Snapshot> {
    const snapshot = await this.snapRepo.findOne({
      where: { id: snapshotId },
      relations: ['images'],
    });
    if (!snapshot) {
      throw new NotFoundException('Snapshot không tồn tại');
    }
    return snapshot;
  }

  /**
   * Upload ảnh vào snapshot mới nhất của crop active
   */
  async addImageToLatestSnapshot(
    deviceId: string,
    url: string,
  ): Promise<CameraImage> {
    const crop = await this.cropRepo.findOne({
      where: { deviceId, isActive: true },
    });
    if (!crop) {
      throw new NotFoundException('Không tìm thấy crop active');
    }

    const latestSnapshot = await this.snapRepo.findOne({
      where: { cropInstanceId: crop.id },
      order: { timestamp: 'DESC' },
    });
    if (!latestSnapshot) {
      throw new NotFoundException('Không tìm thấy snapshot nào');
    }

    const image = this.imgRepo.create({
      snapshotId: latestSnapshot.id,
      url,
    });
    return this.imgRepo.save(image);
  }
}
