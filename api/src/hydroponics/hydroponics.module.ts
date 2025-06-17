import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlantType } from '../plant-type/entity/plant-type.entity';
import { CropInstance } from './entities/crop-instance.entity';
import { Snapshot } from './entities/snapshot.entity';
import { CameraImage } from './entities/camera-image.entity';
import { User } from 'src/user/entities/user.entity';
import { HydroponicsController } from './v1/hydroponics.controller';
import { HydroponicsService } from './v1/hydroponics.service';
import { PlantTypeModule } from 'src/plant-type/plant-type.module';
import { SolutionReading } from './entities/solution-reading.entity';
import { SensorReading } from './entities/sensor-reading.entity';
import { HttpModule } from '@nestjs/axios';
import { Decision } from './entities/decision.entity';

@Module({
  imports: [
    PlantTypeModule,
    TypeOrmModule.forFeature([
      User,
      PlantType,
      CropInstance,
      Snapshot,
      CameraImage,
      SolutionReading,
      SensorReading,
      Decision,
    ]),
    HttpModule,
  ],
  controllers: [HydroponicsController],
  providers: [HydroponicsService],
  exports: [HydroponicsService],
})
export class HydroponicsModule {}
