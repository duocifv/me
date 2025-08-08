// src/mqtt/mqtt.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { AddCameraChunkDto, ChunkCache } from './dto/add-camera-chunk.dto';
import { ErrorDto } from './dto/error.dto';
import cloudinary from 'src/plugins/media/cloudinary.provider';
import { ScheduleService } from 'src/schedule/schedule.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiteCamera } from 'src/sqlite/lite-camera.entity';
import { LiteErrors } from '../sqlite/lite-errors.entity';
import { LiteSensors } from '../sqlite/lite-sensors.entity';
import { nowVNDate } from 'src/shared/utils/time';

interface ChunkCacheWithTimestamp extends ChunkCache {
  ts: number;
}

@Injectable()
export class MqttService implements OnModuleInit {
  private lastPing: number = Date.now();
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;
  private chunkCache = new Map<number, ChunkCacheWithTimestamp>();

  constructor(
    private readonly config: ConfigService,
    private readonly scheduleService: ScheduleService,

    @InjectRepository(LiteCamera, 'sqlite')
    private readonly cameraRepo: Repository<LiteCamera>,

    @InjectRepository(LiteErrors, 'sqlite')
    private readonly errorsRepo: Repository<LiteErrors>,

    @InjectRepository(LiteSensors, 'sqlite')
    private readonly sensorsRepo: Repository<LiteSensors>,
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
        'esp32/health',
        'esp32/control',
        'esp32/sensors',
        'esp32/camera',
        'esp32/ping',
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

  private processMessage(topic: string, msg: string) {
    this.logger.debug(`Received [${topic}]: ${msg}`);
    let obj: any;
    try {
      obj = JSON.parse(msg);
    } catch {
      obj = msg;
    }

    const handlerMap = {
      'esp32/health': () => this.handleHealth(),
      'esp32/errors': () => this.createError(obj),
      'esp32/sensors': () => this.createSensor(obj),
      'esp32/camera': () => this.handleCamera(obj, msg),
      'esp32/ping': () => this.handlePing(),
    };

    const handler = handlerMap[topic] as () => void | Promise<void>;
    if (handler) return handler(); // topic hợp lệ
    this.logger.warn(`Unknown topic: ${topic}`);
  }

  handleHealth() {
    this.scheduleService.health = true;
    this.updateControl();
  }

  handlePing() {
    this.lastPing = Date.now();

    if (!this.scheduleService.health) {
      this.logger.log('✅ ESP32 đã kết nối trở lại!');
      this.scheduleService.health = true;
    }
  }

  private async handleCamera(obj: any, msg: string) {
    this.logger.debug(`[esp32/camera] => ${msg}`);
    if (this.isValidChunk(obj)) {
      const result = await this.handleImageChunk(obj);
      if (result.status === 'image_complete') {
        this.logger.log(`📷 Full image received (id=${obj.id})`);
      }
    }
  }

  private async uploadToCloudinary(buffer: Buffer): Promise<string | null> {
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'media',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Upload error:', error.message);
            resolve(null); // Không throw, chỉ trả về null
          } else {
            resolve(result?.secure_url || null);
          }
        },
      );

      uploadStream.end(buffer);
    });
  }

  private async createCamera(url: string): Promise<LiteCamera> {
    return await this.cameraRepo.save({ url, createdAt: nowVNDate() });
  }

  private isValidChunk(o: any): o is AddCameraChunkDto {
    return (
      typeof o === 'object' &&
      typeof o.id === 'number' &&
      typeof o.index === 'number' &&
      typeof o.total === 'number' &&
      typeof o.total === 'number' &&
      typeof o.data === 'string'
    );
  }

  public async handleImageChunk(dto: AddCameraChunkDto) {
    const { id, index, total, data } = dto;

    let cache = this.chunkCache.get(id);

    // Nếu không có cache hoặc cache quá cũ (hơn 2 phút), tạo mới
    if (!cache || Date.now() - cache.ts > 120_000) {
      cache = {
        total,
        received: Array(total).fill(''),
        receivedCount: 0,
        ts: Date.now(),
      };
    }

    // Nếu chunk tại vị trí index chưa được nhận thì cập nhật
    if (!cache.received[index]) {
      cache.received[index] = data;
      cache.receivedCount++;
      cache.ts = Date.now();
    }

    // Đã nhận đủ toàn bộ chunks
    if (cache.receivedCount === total) {
      this.chunkCache.delete(id);
      const fullBase64 = cache.received.join('');
      const buffer = Buffer.from(fullBase64, 'base64');

      const url = await this.uploadToCloudinary(buffer);
      if (url) {
        await this.createCamera(url);
      } else {
        this.logger.error(`❌ Upload failed, cannot append image: ${id}`);
        return { status: 'upload_failed', id };
      }
      this.logger.log(`📷 Full image received and uploaded: ${url}`);

      return {
        status: 'image_complete',
        id,
        url,
      };
    }

    // Chưa nhận đủ, lưu lại cache tạm thời
    this.chunkCache.set(id, cache);
    return {
      status: 'chunk_received',
      id,
      index,
      progress: `${cache.receivedCount}/${total}`,
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

  async findAllSensor(): Promise<LiteSensors[]> {
    return await this.sensorsRepo.find();
  }

  async findLastSensor(): Promise<LiteSensors> {
    const last = await this.sensorsRepo.findOne({
      where: {},
      order: { id: 'DESC' },
    });
    if (!last) throw new Error('No sensor data found');
    return last;
  }

  async createSensor(dto: CreateSnapshotDto): Promise<LiteSensors> {
    return await this.sensorsRepo.save(dto);
  }

  async deleteSensor() {
    await this.sensorsRepo.clear();
    return { success: true };
  }

  async findAllCamera(): Promise<LiteCamera[]> {
    return await this.cameraRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async deleteCamera() {
    await this.cameraRepo.clear();
    return { success: true };
  }

  async findAllError(): Promise<LiteErrors[]> {
    return await this.errorsRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createError(dto: ErrorDto): Promise<LiteErrors> {
    return await this.errorsRepo.save({ ...dto, createdAt: nowVNDate() });
  }

  async deleteError() {
    await this.errorsRepo.clear();
    return { success: true };
  }

  updateControl() {
    const config = this.scheduleService.getLatestConfig();
    this.publish('esp32/control', config);
  }

  findOneControl() {
    return this.scheduleService.getLatestConfig();
  }
}
