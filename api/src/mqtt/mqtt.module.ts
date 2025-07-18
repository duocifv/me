// mqtt/mqtt.module.ts
import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MQTTController } from './mqtt.controller';

@Module({
  controllers: [MQTTController],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
