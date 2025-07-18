// src/mqtt/mqtt.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: mqtt.MqttClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('MQTT_HOST');
    const port = this.config.get<number>('MQTT_PORT');
    const username = this.config.get<string>('MQTT_USER');
    const password = this.config.get<string>('MQTT_PASS');
    const protocol =
      this.config.get<'mqtts' | 'wss'>('MQTT_PROTOCOL') || 'mqtts';

    const url = `${protocol}://${host}:${port}`;

    this.client = mqtt.connect(url, {
      username,
      password,
      rejectUnauthorized: false, // ⚠️ Tạm thời bỏ SSL strict để test giống ESP32
    });

    this.client.on('connect', () => {
      console.log('✅ MQTT đã kết nối:', url);

      // Subcribe đúng topic ESP32 đang gửi
      this.client.subscribe('esp32/response', (err) => {
        if (err) {
          console.error('❌ Lỗi sub topic:', err.message);
        } else {
          console.log('📡 Subscribed to topic: esp32/response');
        }
      });

      // Có thể publish test luôn
      this.publish('esp32/screen', 'Turn on the screen');
    });

    this.client.on('message', (topic, payload) => {
      const msg = payload.toString();
      console.log(`📩 Tin nhắn từ "${topic}": ${msg}`);
    });

    this.client.on('error', (err) => {
      console.error('❌ Lỗi kết nối MQTT:', err.message);
    });
  }

  publish(topic: string, message: string) {
    if (this.client?.connected) {
      this.client.publish(topic, message);
      console.log(`📤 Đã gửi "${message}" đến "${topic}"`);
    } else {
      console.warn('⚠️ MQTT chưa kết nối!');
    }
  }
}
