// mqtt/mqtt.module.ts
import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [MqttController],
  providers: [MqttService, RedisService],
  exports: [MqttService],
})
export class MqttModule {}
