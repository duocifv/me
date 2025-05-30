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
import { SensorData, SolutionData } from '../type/snapshot.type';

@Entity({ name: 'snapshots' })
@Index('IDX_CROP_INSTANCE', ['cropInstanceId'])
export class Snapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CropInstance, (ci) => ci.snapshots, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'cropInstanceId' })
  cropInstance: CropInstance;

  @Column({ name: 'cropInstanceId' })
  cropInstanceId: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'json', nullable: true })
  sensorData: SensorData;

  @Column({ type: 'json', nullable: true })
  solutionData: SolutionData;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => CameraImage, (img) => img.snapshot, {
    cascade: ['insert', 'remove'],
  })
  images: CameraImage[];
}
