import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantType } from '../entity/plant-type.entity';
import { CreatePlantTypeDto } from '../dto/create-plant-type.dto';
import { UpdatePlantTypeDto } from '../dto/update-plant-type.dto';
import { MediaFile } from 'src/media/entities/media.entity';

@Injectable()
export class PlantTypeService {
  constructor(
    @InjectRepository(PlantType)
    private readonly repo: Repository<PlantType>,
    @InjectRepository(MediaFile)
    private readonly mediaRepo: Repository<MediaFile>,
  ) {}

  async findAll(): Promise<PlantType[]> {
    return this.repo.find({ relations: ['mediaFile', 'cropInstances'] });
  }

  async findById(id: number): Promise<PlantType> {
    const pt = await this.repo.findOne({
      where: { id },
      relations: ['mediaFile', 'cropInstances'],
    });
    if (!pt) throw new NotFoundException('PlantType not found');
    return pt;
  }

  async create(dto: CreatePlantTypeDto): Promise<PlantType> {
    const exists = await this.repo.findOne({ where: { slug: dto.slug } });
    if (exists) {
      throw new ConflictException(`Slug '${dto.slug}' đã tồn tại`);
    }

    const media = await this.mediaRepo.findOne({ where: { id: dto.mediaId } });
    if (!media) throw new NotFoundException('MediaFile không tồn tại');

    const entity = this.repo.create({
      slug: dto.slug,
      displayName: dto.displayName,
      mediaFile: media,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdatePlantTypeDto): Promise<PlantType> {
    const pt = await this.findById(id);

    if (dto.slug && dto.slug !== pt.slug) {
      const conflict = await this.repo.findOne({ where: { slug: dto.slug } });
      if (conflict) throw new ConflictException('Slug đã tồn tại');
      pt.slug = dto.slug;
    }

    if (dto.displayName) {
      pt.displayName = dto.displayName;
    }

    if (dto.mediaId) {
      const media = await this.mediaRepo.findOne({
        where: { id: dto.mediaId },
      });
      if (!media) throw new NotFoundException('MediaFile không tồn tại');
      pt.mediaFile = media;
    }

    return this.repo.save(pt);
  }

  async remove(id: number): Promise<void> {
    const pt = await this.findById(id);
    await this.repo.remove(pt);
  }
}
