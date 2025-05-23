import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MediaFile } from './entities/file.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaDto } from './dto/media.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { MediaEsp32Dto } from './dto/media-esp32.schema';
import { MediaCategory } from './type/media-category.type';

@Injectable()
export class UploadFileService {
  constructor(
    @InjectRepository(MediaFile)
    private readonly mediaRepo: Repository<MediaFile>,
  ) {}

  async paginateMedia(dto: MediaDto): Promise<Pagination<MediaFile>> {
    const { page, limit, mimetype, category, startDate, endDate } = dto;
    const qb = this.mediaRepo.createQueryBuilder('media_files');

    if (mimetype) {
      qb.andWhere('media_files.mimetype = :mimetype', { mimetype });
    }

    // qb.andWhere('media.category != :esp32', { esp32: 'esp32' });

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

  async getMediaStatsByCategory(categories: MediaCategory[]) {
    if (!categories || categories.length === 0) {
      return { count: 0 };
    }

    const qb = this.mediaRepo.createQueryBuilder('media_files');

    qb.where(
      categories
        .map((_, i) => `JSON_CONTAINS(media_files.category, :cat${i})`)
        .join(' OR '),
      Object.fromEntries(categories.map((c, i) => [`cat${i}`, `"${c}"`])),
    );

    const count = await qb.getCount();
    return { count };
  }

  async findByMimeType(type: string): Promise<MediaFile[]> {
    return this.mediaRepo.find({
      where: { mimetype: type },
      order: { createdAt: 'DESC' },
    });
  }

  async getMediaWithStats(): Promise<{
    totalFile: number;
    usedStorageBytes: number;
    maxStorageBytes: number;
  }> {
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

  async findManyByIds(ids: string[]): Promise<MediaFile[]> {
    return this.mediaRepo.find({
      where: {
        id: In(ids),
      },
    });
  }

  async findAll(): Promise<MediaFile[]> {
    return this.mediaRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<MediaFile> {
    const file = await this.mediaRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async saveImage(dto: CreateMediaDto): Promise<MediaFile> {
    const file = this.mediaRepo.create(dto);
    return this.mediaRepo.save(file);
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
