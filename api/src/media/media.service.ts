import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaFile } from './entities/file.entity';
import { CreateMediaDto } from './dto/CreateMediaDto';
import { PaginationService } from 'src/shared/pagination/pagination.service';

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

  async findAllPaginate(dto: any) {
    const { page, limit, ...filters } = dto;
    const qb = this.mediaRepo.createQueryBuilder('media_files');
    const paginate = await this.paginationService.paginate(
      qb,
      { page, limit },
      '/media_files',
      filters,
      ['email'],
    );
    return {
      items: paginate.items,
      meta: paginate.meta,
    };
  }

  async getMediaWithStats(): Promise<any> {
    const totalFile = await this.mediaRepo.count();
    return { totalFile, toltalStorage: 94, ImagesStorage: 26 };
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
