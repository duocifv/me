// src/services/hydroponics.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

import { CreateCropInstanceDto } from '../dto/create-crop-instance.dto';
import { CreateSnapshotDto } from '../dto/create-snapshot.dto';
import { GetSnapshotsDto } from '../dto/get-snapshots.dto';
import { CreateCameraImageDto } from '../dto/create-camera-image.dto';

import { CropInstance } from '../entities/crop-instance.entity';
import { Snapshot } from '../entities/snapshot.entity';
import { CameraImage } from '../entities/camera-image.entity';
import { SensorReading } from '../entities/sensor-reading.entity';
import { SolutionReading } from '../entities/solution-reading.entity';
import { Decision } from '../entities/decision.entity';

import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HydroponicsService {
  private readonly logger = new Logger(HydroponicsService.name);

  constructor(
    @InjectRepository(CropInstance)
    private readonly cropRepo: Repository<CropInstance>,
    @InjectRepository(Snapshot)
    private readonly snapRepo: Repository<Snapshot>,
    @InjectRepository(CameraImage)
    private readonly imgRepo: Repository<CameraImage>,
    @InjectRepository(SensorReading)
    private readonly sensorRepo: Repository<SensorReading>,
    @InjectRepository(SolutionReading)
    private readonly solutionRepo: Repository<SolutionReading>,
    @InjectRepository(Decision)
    private readonly decisionRepo: Repository<Decision>,
    private readonly http: HttpService,
  ) {}

  /**
   * Tạo crop instance mới, đặt là active
   * và tự động deactivate các instance cũ cùng deviceId.
   */
  async createCropInstance(
    deviceId: string,
    dto: CreateCropInstanceDto,
  ): Promise<CropInstance> {
    await this.cropRepo.update(
      { deviceId, isActive: true },
      { isActive: false },
    );
    const crop = this.cropRepo.create({
      deviceId,
      plantTypeId: dto.plantTypeId,
      name: dto.name,
      isActive: true,
    });
    return this.cropRepo.save(crop);
  }

  /**
   * Trả về danh sách crop instance theo deviceId.
   */
  async getCropInstances(deviceId: string): Promise<CropInstance[]> {
    return this.cropRepo.find({
      where: { deviceId },
      relations: {
        plantType: {
          mediaFile: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Tạo snapshot mới cho crop đang active của deviceId,
   * đồng thời gọi AI để nhận quyết định và lưu vào bảng decision.
   */
  async createSnapshot(
    deviceId: string,
    dto: CreateSnapshotDto,
  ): Promise<void> {
    const crop = await this.cropRepo.findOne({
      where: { deviceId, isActive: true },
    });

    if (!crop) {
      this.logger.warn(`Không tìm thấy crop active cho deviceId: ${deviceId}`);
      return;
    }

    const snapshot = this.snapRepo.create({
      cropInstanceId: crop.id,
      waterTemp: dto.waterTemp,
      ambientTemp: dto.ambientTemp,
      humidity: dto.humidity,
      ph: dto.ph,
      ec: dto.ec,
      orp: dto.orp,
    });

    const saved = await this.snapRepo.save(snapshot);

    try {
      const fullSnapshot = await this.snapRepo.findOne({
        where: { id: saved.id },
        relations: ['images'],
      });

      const response = await lastValueFrom(
        this.http.post('http://crop.duocnv.top/decision', fullSnapshot),
      );

      const decision = this.decisionRepo.create({
        snapshot: saved,
        result: response.data,
      });

      await this.decisionRepo.save(decision);
    } catch (err) {
      this.logger.error('Lỗi khi gọi AI hoặc lưu kết quả:', err.message);
    }
  }

  async getDecisionBySnapshotId(snapshotId: number): Promise<Decision | null> {
    return this.decisionRepo.findOne({
      where: { snapshot: { id: snapshotId } },
      relations: ['snapshot'],
    });
  }

  /**
   * Trả về danh sách snapshots (metadata + ảnh) theo deviceId (có phân trang).
   */
  async getSnapshotsByDevice(
    dto: GetSnapshotsDto,
  ): Promise<Pagination<Snapshot>> {
    const { deviceId, page, limit } = dto;

    const crop = await this.cropRepo.findOne({
      where: { deviceId, isActive: true },
    });
    if (!crop) {
      throw new NotFoundException('Không tìm thấy crop active');
    }

    const qb = this.snapRepo
      .createQueryBuilder('snapshot')
      .leftJoinAndSelect('snapshot.images', 'image')
      .where('snapshot.cropInstanceId = :cropId', { cropId: crop.id })
      .orderBy('snapshot.timestamp', 'DESC');

    return paginate<Snapshot>(qb, {
      page,
      limit,
      route: `/snapshots?deviceId=${encodeURIComponent(deviceId)}`,
    });
  }

  /**
   * Trả về chi tiết một snapshot (metadata + ảnh) theo ID.
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
   * Trả về toàn bộ sensor readings cho một snapshot.
   */
  async getSensorReadingsBySnapshot(
    snapshotId: number,
  ): Promise<SensorReading[]> {
    return this.sensorRepo.find({
      where: { snapshotId },
      order: { recordedAt: 'ASC' },
    });
  }

  /**
   * Trả về toàn bộ solution readings cho một snapshot.
   */
  async getSolutionReadingsBySnapshot(
    snapshotId: number,
  ): Promise<SolutionReading[]> {
    return this.solutionRepo.find({
      where: { snapshotId },
      order: { recordedAt: 'ASC' },
    });
  }

  /**
   * Thêm ảnh mới vào snapshot gần nhất của crop đang active.
   */
  async addImageToLatestSnapshot(
    deviceId: string,
    dto: CreateCameraImageDto,
  ): Promise<CameraImage> {
    const crop = await this.cropRepo.findOne({
      where: { deviceId, isActive: true },
    });
    if (!crop) {
      throw new NotFoundException('Không tìm thấy crop active');
    }

    const latest = await this.snapRepo.findOne({
      where: { cropInstanceId: crop.id },
      order: { timestamp: 'DESC' },
    });
    if (!latest) {
      throw new NotFoundException('Không tìm thấy snapshot gần nhất');
    }

    const image = this.imgRepo.create({
      snapshotId: latest.id,
      filePath: dto.filePath,
      size: dto.size,
    });
    return this.imgRepo.save(image);
  }
}
