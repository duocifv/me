import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaFile } from './entities/file.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { PaginationService } from 'src/shared/pagination/pagination.service';
import { MediaDto } from './dto/media.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class UploadFileService {
  constructor(
    @InjectRepository(MediaFile)
    private readonly mediaRepo: Repository<MediaFile>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(dto: CreateMediaDto): Promise<MediaFile> {
    const file = this.mediaRepo.create(dto);
    return this.mediaRepo.save(file);
  }

  async paginateMedia(dto: MediaDto): Promise<Pagination<MediaFile>> {
    const { page, limit, mimetype, category, startDate, endDate } = dto;
    const qb = this.mediaRepo.createQueryBuilder('media_files');

    if (mimetype) {
      qb.andWhere('media_files.mimetype = :mimetype', { mimetype });
    }
    if (category) {
      qb.andWhere('media_files.category = :category', { category });
    }
    if (startDate) {
      qb.andWhere('media_files.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('media_files.createdAt <= :endDate', { endDate });
    }

    return paginate<MediaFile>(qb, {
      page,
      limit,
      route: '/media',
    });
  }

  async findByMimeType(type: string): Promise<MediaFile[]> {
    return this.mediaRepo.find({
      where: { mimetype: type },
      order: { createdAt: 'DESC' },
    });
  }

  async getMediaWithStats(): Promise<any> {
    const totalFile = await this.mediaRepo.count();
    const rawTotal = await this.mediaRepo
      .createQueryBuilder('media')
      .select('SUM(media.size)', 'totalStorage')
      .getRawOne();

    const totalStorage = Number(rawTotal?.totalStorage) || 0;
    const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10GB
    return {
      totalFile,
      usedStorageBytes: totalStorage,
      maxStorageBytes: MAX_STORAGE_BYTES,
    };
  }
  async findAll(): Promise<MediaFile[]> {
    return this.mediaRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<MediaFile> {
    const file = await this.mediaRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async update(id: string, updateData: Partial<MediaFile>): Promise<MediaFile> {
    await this.mediaRepo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.mediaRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('File not found');
  }
}
