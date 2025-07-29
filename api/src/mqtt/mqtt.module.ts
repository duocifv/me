// src/mqtt/mqtt.module.ts
import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    RedisModule,
  ],
  controllers: [MqttController],
  providers: [
    MqttService,  
  ],
  exports: [
    MqttService, 
  ],
})
export class MqttModule {}
