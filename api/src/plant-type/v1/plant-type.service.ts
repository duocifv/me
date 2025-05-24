import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantType } from '../entity/plant-type.entity';
import { CreatePlantTypeDto } from '../dto/create-plant-type.dto';

@Injectable()
export class PlantTypeService {
  constructor(
    @InjectRepository(PlantType)
    private readonly repo: Repository<PlantType>,
  ) { }

  async findAll(): Promise<PlantType[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<PlantType> {
    const plantType = await this.repo.findOne({ where: { id } });
    if (!plantType) {
      throw new NotFoundException('PlantType not found');
    }
    return plantType;
  }

  async findBySlug(slug: string): Promise<PlantType> {
    const plantType = await this.repo.findOne({ where: { slug } });
    if (!plantType) {
      throw new NotFoundException('PlantType not found');
    }
    return plantType;
  }

  async create(dto: CreatePlantTypeDto): Promise<PlantType> {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`PlantType with slug '${dto.slug}' already exists.`);
    }

    const entity = this.repo.create({
      slug: dto.slug,
      displayName: dto.displayName,
    });

    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const pt = await this.findById(id);
    await this.repo.remove(pt);
  }
}
