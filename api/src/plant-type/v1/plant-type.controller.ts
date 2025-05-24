import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { PlantTypeService } from './plant-type.service';
import { CreatePlantTypeDto, CreatePlantTypeSchema } from '../dto/create-plant-type.dto';

@Controller('plant-types')
export class PlantTypeController {
  constructor(private readonly plantTypeService: PlantTypeService) {}

  @Post()
  create(@BodySchema(CreatePlantTypeSchema) dto: CreatePlantTypeDto) {
    return this.plantTypeService.create(dto);
  }

  @Get()
  findAll() {
    return this.plantTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.plantTypeService.findById(id);
  }
}
