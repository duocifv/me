// src/entity/snapshot.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { CropInstance } from './crop-instance.entity';
import { CameraImage } from './camera-image.entity';
import { SolutionReading } from './solution-reading.entity';
import { SensorReading } from './sensor-reading.entity';
import { Decision } from './decision.entity';

@Entity({ name: 'snapshots' })
@Index('IDX_SNAPSHOT_CROP_TIME', ['cropInstanceId', 'timestamp'])
export class Snapshot {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => CropInstance, (ci) => ci.snapshots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'crop_instance_id' })
  cropInstance: CropInstance;

  @Column({ name: 'crop_instance_id', type: 'bigint' })
  cropInstanceId: number;

  @CreateDateColumn({ name: 'timestamp', type: 'timestamp' })
  @Index('IDX_SNAPSHOT_TIME')
  timestamp: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'water_temp', type: 'float' })
  waterTemp: number;

  @Column({ name: 'ambient_temp', type: 'float' })
  ambientTemp: number;

  @Column({ name: 'humidity', type: 'float' })
  humidity: number;

  @Column({ name: 'ph', type: 'float' })
  ph: number;

  @Column({ name: 'ec', type: 'float' })
  ec: number;

  @Column({ name: 'orp', type: 'float' })
  orp: number;

  @OneToMany(() => CameraImage, (img) => img.snapshot, {
    cascade: ['insert', 'remove'],
  })
  images: CameraImage[];

  @OneToMany(() => SolutionReading, (sr) => sr.snapshot, {
    cascade: ['insert', 'remove'],
  })
  solutionReadings: SolutionReading[];

  @OneToMany(() => SensorReading, (sr) => sr.snapshot, {
    cascade: ['insert', 'remove'],
  })
  sensorReadings: SensorReading[];

  @OneToMany(() => Decision, (decision) => decision.snapshot)
  decisions: Decision[];
}
