// src/mqtt/mqtt.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { AddImagesDto } from './dto/add-camera-image.dto';
import { UpdateScreenDto } from './dto/screen.dto';

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;

  private latestSensor: CreateSnapshotDto | null = null;
  private latestCamera: AddImagesDto | null = null;
  private latestScreen: UpdateScreenDto | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const protocol = this.config.get<'mqtt' | 'mqtts' | 'ws' | 'wss'>('MQTT_PROTOCOL', 'mqtts');
    const host = this.config.get<string>('MQTT_HOST');
    const port = this.config.get<number>('MQTT_PORT');
    const username = this.config.get<string>('MQTT_USER');
    const password = this.config.get<string>('MQTT_PASS');
    const url = `${protocol}://${host}:${port}`;

    this.client = mqtt.connect(url, { username, password, rejectUnauthorized: false });

    this.client.on('connect', () => {
      this.logger.log(`MQTT connected to ${url}`);
      const topics = ['esp32/response', 'esp32/errors', 'esp32/screen', 'esp32/sensors', 'esp32/camera'];
      this.client.subscribe(topics, (err, granted = []) => {
        if (err) this.logger.error('Subscribe error', err.message);
        else granted.forEach(g => this.logger.log(`Subscribed ${g.topic} (QoS ${g.qos})`));
      });
    });

    this.client.on('message', (topic, payload) => this.processMessage(topic, payload.toString()));
    this.client.on('error', err => this.logger.error('MQTT error', err.message));
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
      case 'esp32/response': this.handleResponse(obj); break;
      case 'esp32/errors':   this.handleError(obj); break;
      case 'esp32/screen':   this.handleScreen(obj); break;
      case 'esp32/sensors':  this.handleSensor(obj); break;
      case 'esp32/camera':   this.handleCamera(obj); break;
      default: this.logger.warn(`Unknown topic: ${topic}`);
    }
  }

  private handleResponse(data: any) {
    this.logger.log(`Response: ${JSON.stringify(data)}`);
  }

  private handleError(data: any) {
    this.logger.error(`ESP32 error: ${JSON.stringify(data)}`);
  }

  private handleScreen(data: UpdateScreenDto) {
    this.latestScreen = data;
    this.logger.log(`Updated screen state: ${JSON.stringify(data)}`);
    this.publish('esp32/response', 'Screen command received');
  }

  private handleSensor(data: CreateSnapshotDto) {
    this.latestSensor = data;
    this.logger.log(`Updated latest sensor snapshot: ${data.id}`);
  }

  private handleCamera(data: AddImagesDto) {
    this.latestCamera = data;
    this.logger.log(`Updated latest camera images for snapshot ${data.snapshotId}`);
  }

  publish(topic: string, message: string | object) {
    if (!this.client.connected) {
      this.logger.warn('MQTT not connected');
      return;
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    this.client.publish(topic, payload);
    this.logger.log(`Published to ${topic}: ${payload}`);
  }

  getLatestSensor(): CreateSnapshotDto | null {
    return this.latestSensor;
  }

  getLatestCamera(): AddImagesDto | null {
    return this.latestCamera;
  }

  getLatestScreen(): UpdateScreenDto | null {
    return this.latestScreen;
  }

  clearLatestSensor(): void {
    this.latestSensor = null;
  }

  clearLatestCamera(): void {
    this.latestCamera = null;
  }

  clearLatestScreen(): void {
    this.latestScreen = null;
  }
}
