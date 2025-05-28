// src/plant-type/plant-type.controller.ts
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { PlantTypeService } from './plant-type.service';
import {
  CreatePlantTypeDto,
  CreatePlantTypeSchema,
} from '../dto/create-plant-type.dto';

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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plantTypeService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @BodySchema(UpdatePlantTypeSchema) dto: UpdatePlantTypeDto,
  ) {
    return this.plantTypeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plantTypeService.remove(id);
  }
}
