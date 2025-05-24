import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateMediaDto } from './dto/create-media.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { MediaFile } from './entities/file.entity';

@Injectable()
export class MediaEsp32Service {
  constructor(
    @InjectRepository(MediaEsp32File)
    private readonly esp32Repo: Repository<MediaEsp32File>,
  ) {}

  async paginateMediaByCategory(
    dto: MediaEsp32Dto,
  ): Promise<Pagination<MediaFile>> {
    const { page, limit, category, startDate, endDate } = dto;

    const qb = this.mediaRepo.createQueryBuilder('media_files');

    const catArray = Array.isArray(category) ? category : [category];

    if (catArray.length > 0) {
      qb.andWhere(
        catArray
          .map((_, i) => `JSON_CONTAINS(media_files.category, :cat${i})`)
          .join(' OR '),
        Object.fromEntries(catArray.map((c, i) => [`cat${i}`, `"${c}"`])),
      );
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
      route: `/media`,
    });
  }

  async findOne(id: string): Promise<MediaEsp32File> {
    const file = await this.esp32Repo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('ESP32 media file not found');
    return file;
  }

  async save(dto: CreateMediaDto): Promise<MediaEsp32File> {
    const file = this.esp32Repo.create(dto);
    return this.esp32Repo.save(file);
  }

  async update(
    id: string,
    updateData: Partial<MediaEsp32File>,
  ): Promise<MediaEsp32File> {
    await this.esp32Repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.esp32Repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('ESP32 media file not found');
  }
}
