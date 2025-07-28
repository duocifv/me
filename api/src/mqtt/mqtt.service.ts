// src/mqtt/mqtt.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { AddCameraChunkDto, ChunkCache } from './dto/add-camera-chunk.dto';
import { Esp32ErrorDto } from './dto/error.dto';
import { AddImagesDto } from './dto/add-camera-image.dto';
import { UpdateControlDto } from './dto/control.dto';

interface ChunkCacheWithTimestamp extends ChunkCache {
  ts: number;
}

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;

  private latestSensor: CreateSnapshotDto | null = null;
  private latestControl: UpdateControlDto | null = null;
  private latestError: Esp32ErrorDto | null = null;
  private latestCamera: AddImagesDto | null = null;
  private chunkStore = new Map<number, ChunkCacheWithTimestamp>();

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const protocol = this.config.get<'mqtt' | 'mqtts' | 'ws' | 'wss'>(
      'MQTT_PROTOCOL',
      'mqtts',
    );
    const host = this.config.get<string>('MQTT_HOST');
    const port = this.config.get<number>('MQTT_PORT');
    const username = this.config.get<string>('MQTT_USER');
    const password = this.config.get<string>('MQTT_PASS');
    const url = `${protocol}://${host}:${port}`;

    this.client = mqtt.connect(url, {
      username,
      password,
      rejectUnauthorized: false,
    });

    this.client.on('connect', () => {
      this.logger.log(`MQTT connected to ${url}`);
      const topics = [
        'esp32/response',
        'esp32/errors',
        'esp32/control',
        'esp32/sensors',
        'esp32/camera',
      ];
      this.client.subscribe(topics, (err, granted = []) => {
        if (err) this.logger.error('Subscribe error', err.message);
        else
          granted.forEach((g) =>
            this.logger.log(`Subscribed ${g.topic} (QoS ${g.qos})`),
          );
      });
    });

    this.client.on('message', (topic, payload) => {
      this.processMessage(topic, payload.toString());
    });

    this.client.on('error', (err) =>
      this.logger.error('MQTT error', err.message),
    );
  }

  private processMessage(topic: string, msg: string) {
    this.logger.debug(`Received [${topic}]: ${msg}`);
    let obj: any;
    try {
      obj = JSON.parse(msg);
    } catch {
      obj = msg;
    }

    switch (topic) {
      case 'esp32/response':
        this.handleResponse(obj);
        break;
      case 'esp32/errors':
        this.handleError(obj);
        break;
      case 'esp32/control':
        this.handleControl(obj);
        break;
      case 'esp32/sensors':
        this.handleSensor(obj);
        break;
      case 'esp32/camera':
        this.logger.debug(`[esp32/camera] => ${msg}`);
        if (
          typeof obj === 'object' &&
          typeof obj.id === 'number' &&
          typeof obj.index === 'number' &&
          typeof obj.total === 'number' &&
          typeof obj.data === 'string'
        ) {
          const result = this.handleImageChunk(obj);
          if (result.status === 'image_complete') {
            this.logger.log(`📷 Full image received (id=${obj.id})`);
          }
        }
        break;
      default:
        this.logger.warn(`Unknown topic: ${topic}`);
    }
  }

  private handleResponse(data: any) {
    this.logger.log(`Response: ${JSON.stringify(data)}`);
  }

  private handleError(data: Esp32ErrorDto) {
    this.latestError = data;
    this.logger.error(`ESP32 error: ${JSON.stringify(data)}`);
  }

  private handleControl(data: UpdateControlDto) {
    this.latestControl = data;
    this.logger.log(`Updated control state: ${JSON.stringify(data)}`);
    this.publish('esp32/response', 'Control command received');
  }

  private handleSensor(data: CreateSnapshotDto) {
    this.latestSensor = data;
    this.logger.log(
      `✅ Updated latest sensor snapshot: ${JSON.stringify(data)}`,
    );
  }

  private cleanupOldChunks() {
    const now = Date.now();
    for (const [id, cache] of this.chunkStore.entries()) {
      if (now - cache.ts > 120_000) {
        this.chunkStore.delete(id);
        this.logger.warn(`⏳ Removed stale image chunks for id=${id}`);
      }
    }
  }

  handleImageChunk(dto: AddCameraChunkDto) {
    const { id, index, total, data } = dto;

    this.cleanupOldChunks();

    if (!this.chunkStore.has(id)) {
      this.chunkStore.set(id, {
        total,
        received: Array(total).fill(''),
        receivedCount: 0,
        ts: Date.now(),
      });
    }

    const cache = this.chunkStore.get(id)!;

    if (!cache.received[index]) {
      cache.received[index] = data;
      cache.receivedCount++;
      cache.ts = Date.now(); // ✅ cập nhật thời gian mỗi khi nhận chunk mới
    }

    if (cache.receivedCount === total) {
      const fullBase64 = cache.received.join('');
      this.chunkStore.delete(id);

      this.latestCamera = {
        snapshotId: id,
        images: [fullBase64],
      };

      this.logger.log(`✅ Full image base64 length: ${fullBase64.length}`);
      this.logger.debug(
        '✅ Ảnh đầy đủ nhận được: ' + fullBase64.substring(0, 100) + '...',
      );

      return { status: 'image_complete', id };
    }

    return {
      status: 'chunk_received',
      id,
      index,
      progress: `${cache.receivedCount}/${cache.total}`,
    };
  }

  publish(topic: string, message: string | object) {
    if (!this.client.connected) {
      this.logger.warn('MQTT not connected');
      return;
    }

    const payload =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.client.publish(topic, payload);
    this.logger.log(`Published to ${topic}: ${payload}`);
  }

  getLatestSensor(): CreateSnapshotDto | null {
    return this.latestSensor;
  }

  getLatestError(): Esp32ErrorDto | null {
    return this.latestError;
  }

  getLatestCamera(): AddImagesDto | null {
    return this.latestCamera;
  }

  getLatestControl(): UpdateControlDto | null {
    return this.latestControl;
  }

  clearLatestSensor(): void {
    this.latestSensor = null;
  }

  clearLatestCamera(): void {
    this.latestCamera = null;
  }

  clearLatestControl(): void {
    this.latestControl = null;
  }

  clearLatestError(): void {
    this.latestError = null;
  }
}
