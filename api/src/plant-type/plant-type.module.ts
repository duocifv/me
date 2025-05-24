import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantTypeService } from './v1/plant-type.service';
import { PlantTypeController } from './v1/plant-type.controller';
import { PlantType } from 'src/plant-type/entity/plant-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PlantType])],
    controllers: [PlantTypeController],
    providers: [PlantTypeService],
    exports: [PlantTypeService],
})
export class PlantTypeModule { }
