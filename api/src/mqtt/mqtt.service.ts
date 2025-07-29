// src/mqtt/mqtt.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { RedisService } from 'src/redis/redis.service';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { AddCameraChunkDto, ChunkCache } from './dto/add-camera-chunk.dto';
import { Esp32ErrorDto } from './dto/error.dto';
import { AddImagesDto } from './dto/add-camera-image.dto';
import { UpdateControlDto } from './dto/control.dto';
import cloudinary from 'src/plugins/media/cloudinary.provider';
import { UploadApiResponse } from 'cloudinary';

interface ChunkCacheWithTimestamp extends ChunkCache {
  ts: number;
}

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

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

    this.client.on(
      'message',
      (topic, payload) => void this.processMessage(topic, payload.toString()),
    );

    this.client.on('error', (err) =>
      this.logger.error('MQTT error', err.message),
    );
  }

  private async processMessage(topic: string, msg: string) {
    this.logger.debug(`Received [${topic}]: ${msg}`);
    let obj: any;
    try {
      obj = JSON.parse(msg);
    } catch {
      obj = msg;
    }

    switch (topic) {
      case 'esp32/errors':
        await this.redis.set('mqtt:latestError', obj);
        this.logger.error(`ESP32 error saved to Redis: ${JSON.stringify(obj)}`);
        break;

      case 'esp32/control':
        await this.redis.set('mqtt:latestControl', obj);
        this.logger.log(`Control state saved to Redis: ${JSON.stringify(obj)}`);
        this.publish('esp32/control', 'Control command received');
        break;

      case 'esp32/sensors':
        await this.redis.set('mqtt:latestSensor', obj);
        this.logger.log(
          `Sensor snapshot saved to Redis: ${JSON.stringify(obj)}`,
        );
        break;

      case 'esp32/camera':
        this.logger.debug(`[esp32/camera] => ${msg}`);
        if (this.isValidChunk(obj)) {
          const result = await this.handleImageChunk(obj);
          if (result.status === 'image_complete') {
            this.logger.log(`📷 Full image received (id=${obj.id})`);
          }
        }
        break;

      default:
        this.logger.warn(`Unknown topic: ${topic}`);
    }
  }

  private async uploadToCloudinary(buffer: Buffer): Promise<string> {
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'media',
            resource_type: 'image',
          },
          (error, result) => {
            if (error)
              reject(new Error(error.message || 'Cloudinary upload failed'));
            else resolve(result as UploadApiResponse);
          },
        )
        .end(buffer);
    });

    return result.secure_url;
  }

  private async appendCameraImage(url: string, id: number): Promise<void> {
    const prev = await this.redis.get<{
      images: { id: number; url: string }[];
    }>('mqtt:latestCamera');

    const updated = {
      images: [...(prev?.images || []), { id, url }],
    };

    await this.redis.set('mqtt:latestCamera', updated);
  }

  private isValidChunk(o: any): o is AddCameraChunkDto {
    return (
      typeof o === 'object' &&
      typeof o.id === 'number' &&
      typeof o.index === 'number' &&
      typeof o.total === 'number' &&
      typeof o.data === 'string'
    );
  }

  public async handleImageChunk(dto: AddCameraChunkDto) {
    const { id, index, total, data } = dto;
    const cacheKey = `mqtt:chunk:${id}`;

    // 1) Lấy cache từ Redis
    let cache = await this.redis.get<ChunkCacheWithTimestamp>(cacheKey);
    if (!cache || Date.now() - cache.ts > 120_000) {
      cache = {
        total,
        received: Array(total).fill(''),
        receivedCount: 0,
        ts: Date.now(),
      };
    }

    // 2) Cập nhật chunk
    if (!cache.received[index]) {
      cache.received[index] = data;
      cache.receivedCount++;
      cache.ts = Date.now();
    }

    // 3) Nếu xong thì gộp, lưu kết quả và xóa cache
    if (cache.receivedCount === total) {
      await this.redis.del(cacheKey);
      const full = cache.received.join('');
      const buffer = Buffer.from(full, 'base64');
      const url = await this.uploadToCloudinary(buffer);

      await this.appendCameraImage(url, id);
      this.logger.log(`📷 Full image received and uploaded: ${url}`);

      return { status: 'image_complete', id, url };
    } else {
      // ngược lại lưu lại cache mới
      await this.redis.set(cacheKey, cache);
      return {
        status: 'chunk_received',
        id,
        index,
        progress: `${cache.receivedCount}/${total}`,
      };
    }
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

  // --- Redis-backed getters & clear ---
  async getLatestSensor(): Promise<CreateSnapshotDto | null> {
    return this.redis.get<CreateSnapshotDto>('mqtt:latestSensor');
  }

  async clearLatestSensor() {
    await this.redis.del('mqtt:latestSensor');
    return { success: true };
  }

  async getLatestCamera(): Promise<AddImagesDto | null> {
    return this.redis.get('mqtt:latestCamera');
  }

  async clearLatestCamera() {
    await this.redis.del('mqtt:latestCamera');
    return { success: true };
  }

  async getLatestError(): Promise<Esp32ErrorDto | null> {
    return this.redis.get<Esp32ErrorDto>('mqtt:latestError');
  }

  async clearLatestError() {
    await this.redis.del('mqtt:latestError');
    return { success: true };
  }

  async handleControlCommand(dto: UpdateControlDto): Promise<void> {
    await this.redis.set('mqtt:latestControl', dto);
    this.publish('esp32/control', dto);
  }

  async getLatestControl(): Promise<UpdateControlDto | null> {
    return this.redis.get<UpdateControlDto>('mqtt:latestControl');
  }

  async clearLatestControl(): Promise<void> {
    await this.redis.del('mqtt:latestControl');
  }
}
