// src/services/hydroponics.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCropInstanceDto } from '../dto/create-crop-instance.dto';
import { CreateSnapshotDto } from '../dto/create-snapshot.dto';
import { GetSnapshotsDto } from '../dto/get-snapshots.dto';

import { CropInstance } from '../entities/crop-instance.entity';
import { Snapshot } from '../entities/snapshot.entity';
import { CameraImage } from '../entities/camera-image.entity';
import { SensorReading } from '../entities/sensor-reading.entity';
import { SolutionReading } from '../entities/solution-reading.entity';

import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { CreateCameraImageDto } from '../dto/create-camera-image.dto';

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
  ) {}

  /**
   * Tạo crop instance mới (với deviceId), đặt isActive = true
   * và deactivate (isActive = false) tất cả crop cũ của cùng deviceId.
   */
  async createCropInstance(
    deviceId: string,
    dto: CreateCropInstanceDto,
  ): Promise<CropInstance> {
    // Deactivate tất cả crop instance đang active cho deviceId này
    await this.cropRepo.update(
      { deviceId, isActive: true },
      { isActive: false },
    );

    const crop = this.cropRepo.create({
      deviceId: deviceId,
      plantTypeId: dto.plantTypeId,
      name: dto.name,
      isActive: true,
    });
    return this.cropRepo.save(crop);
  }

  /**
   * Lấy tất cả crop instances của một device theo deviceId
   */
  async getCropInstances(deviceId: string): Promise<CropInstance[]> {
    return this.cropRepo.find({
      where: { deviceId },
      relations: ['plantType'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Tạo một Snapshot mới (metadata) cho crop đang active của deviceId.
   * Sau đó chèn từng dòng SensorReading và SolutionReading.
   * Được chạy bất đồng bộ qua process.nextTick để không block request chính.
   */
  createSnapshot(deviceId: string, dto: CreateSnapshotDto): void {
    process.nextTick(async () => {
      try {
        // 1. Tìm crop instance đang active
        const crop = await this.cropRepo.findOne({
          where: { deviceId, isActive: true },
        });

        if (!crop) {
          this.logger.warn(
            `Không tìm thấy crop active cho deviceId: ${deviceId}. Bỏ qua tạo snapshot.`,
          );
          return;
        }

        // 2. Tạo Snapshot metadata
        const snapshot = this.snapRepo.create({
          cropInstanceId: crop.id,
        });
        const savedSnapshot = await this.snapRepo.save(snapshot);
        const recordedAt = savedSnapshot.timestamp;

        // 3. Tạo SensorReading (mỗi key:value thành 1 dòng)
        if (dto.sensorData) {
          const sensorRows: SensorReading[] = [];
          for (const [key, val] of Object.entries(dto.sensorData)) {
            const sr = this.sensorRepo.create({
              snapshotId: savedSnapshot.id,
              metricKey: key,
              metricValue: val,
              recordedAt,
            });
            sensorRows.push(sr);
          }
          await this.sensorRepo.save(sensorRows);
        }

        // 4. Tạo SolutionReading
        if (dto.solutionData) {
          const solRows: SolutionReading[] = [];
          for (const [key, val] of Object.entries(dto.solutionData)) {
            const sol = this.solutionRepo.create({
              snapshotId: savedSnapshot.id,
              paramKey: key,
              paramValue: val,
              recordedAt,
            });
            solRows.push(sol);
          }
          await this.solutionRepo.save(solRows);
        }

        this.logger.log(
          `Tạo snapshot id=${savedSnapshot.id} thành công (cropInstanceId=${crop.id}).`,
        );
      } catch (err) {
        this.logger.error('Lỗi khi lưu snapshot và readings:', err);
      }
    });
  }

  /**
   * Lấy danh sách các Snapshot (metadata) của crop đang active theo deviceId
   * (phân trang, không load readings để tránh payload quá lớn).
   */
  async getSnapshotsByDevice(
    dto: GetSnapshotsDto,
  ): Promise<Pagination<Snapshot>> {
    const { deviceId, page, limit } = dto;

    // 1. Tìm crop instance đang active
    const crop = await this.cropRepo.findOne({
      where: { deviceId, isActive: true },
    });
    console.log('crop --------------->>>>>', deviceId, crop);
    if (!crop) {
      throw new NotFoundException(
        'Không tìm thấy crop đang active với deviceId đó',
      );
    }

    // 2. Lấy snapshots (chỉ metadata + images) theo cropId, phân trang
    const queryBuilder = this.snapRepo
      .createQueryBuilder('snapshot')
      .leftJoinAndSelect('snapshot.images', 'image')
      .where('snapshot.cropInstanceId = :cropId', { cropId: crop.id })
      .orderBy('snapshot.timestamp', 'DESC');

    const paginationOptions: IPaginationOptions = {
      page,
      limit,
      route: `/snapshots?deviceId=${encodeURIComponent(deviceId)}`,
    };

    return paginate<Snapshot>(queryBuilder, paginationOptions);
  }

  /**
   * Lấy chi tiết một Snapshot theo ID (chỉ metadata + images).
   * Nếu muốn đọc sensor/solution readings, gọi API riêng.
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
   * Lấy tất cả SensorReading của một snapshot.
   * Trả về đúng kiểu Promise<SensorReading[]> (không dùng any[]).
   */
  async getSensorReadingsBySnapshot(
    snapshotId: number,
  ): Promise<SensorReading[]> {
    // Dùng .find() để TypeORM map thành entity, tránh any[]
    return this.sensorRepo.find({
      where: { snapshotId },
      order: { recordedAt: 'ASC' },
    });
  }

  /**
   * Lấy tất cả SolutionReading của một snapshot.
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
   * Upload ảnh (metadata) vào Snapshot gần nhất (latest) của crop active.
   */
  async addImageToLatestSnapshot(
    deviceId: string,
    dto: CreateCameraImageDto,
  ): Promise<CameraImage> {
    // 1. Tìm crop instance đang active
    const crop = await this.cropRepo.findOne({
      where: { deviceId, isActive: true },
    });
    if (!crop) {
      throw new NotFoundException('Không tìm thấy crop active');
    }

    // 2. Tìm snapshot gần nhất theo timestamp
    const latestSnapshot = await this.snapRepo.findOne({
      where: { cropInstanceId: crop.id },
      order: { timestamp: 'DESC' },
    });
    if (!latestSnapshot) {
      throw new NotFoundException('Không tìm thấy snapshot nào cho crop này');
    }

    // 3. Tạo và lưu CameraImage
    const image = this.imgRepo.create({
      snapshotId: latestSnapshot.id,
      filename: dto.filename,
      url: dto.url,
      mimetype: dto.mimetype,
      size: dto.size ?? null,
      category: dto.category ?? null,
    });
    return this.imgRepo.save(image);
  }
}
