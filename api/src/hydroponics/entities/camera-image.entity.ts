// src/entity/camera-image.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Snapshot } from './snapshot.entity';

@Entity({ name: 'camera_images' })
export class CameraImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Snapshot, (s) => s.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'snapshotId' })
  snapshot: Snapshot;

  @Column()
  snapshotId: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  mimetype: string;
}
