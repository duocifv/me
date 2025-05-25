// src/entity/snapshot.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { CropInstance } from './crop-instance.entity';
import { CameraImage } from './camera-image.entity';

@Entity({ name: 'snapshots' })
export class Snapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CropInstance, (ci) => ci.snapshots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cropInstanceId' })
  cropInstance: CropInstance;

  @Column()
  cropInstanceId: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'json', nullable: true })
  sensorData: Record<string, number>;

  @Column({ type: 'json', nullable: true })
  solutionData: Record<string, number>;

  // Flag chỉ 1 snapshot active cho 1 crop
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => CameraImage, (img) => img.snapshot, {
    cascade: ['insert', 'remove'],
  })
  images: CameraImage[];
}
