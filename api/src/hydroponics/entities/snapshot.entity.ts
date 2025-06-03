// src/entity/snapshot.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { CropInstance } from './crop-instance.entity';
import { CameraImage } from './camera-image.entity';
import { SensorReading } from './sensor-reading.entity';
import { SolutionReading } from './solution-reading.entity';

@Entity({ name: 'snapshots' })
@Index('IDX_SNAPSHOT_CROP_TIME', ['cropInstanceId', 'timestamp'])
export class Snapshot {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => CropInstance, (ci) => ci.snapshots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cropInstanceId' })
  cropInstance: CropInstance;

  @Column({ name: 'cropInstanceId', type: 'bigint' })
  cropInstanceId: number;

  @CreateDateColumn({ type: 'timestamp' })
  @Index('IDX_SNAPSHOT_TIME')
  timestamp: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => CameraImage, (img) => img.snapshot, {
    cascade: ['insert', 'remove'],
  })
  images: CameraImage[];

  @OneToMany(() => SensorReading, (sr) => sr.snapshot, {
    cascade: ['insert', 'remove'],
  })
  sensorReadings: SensorReading[];

  @OneToMany(() => SolutionReading, (sol) => sol.snapshot, {
    cascade: ['insert', 'remove'],
  })
  solutionReadings: SolutionReading[];
}
