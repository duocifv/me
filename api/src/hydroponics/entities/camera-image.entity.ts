// src/entity/camera-image.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
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
  @Index('IDX_IMAGE_SNAPSHOT')
  snapshotId: number;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 50 })
  mimetype: string;

  @Column({ type: 'int', nullable: true })
  size: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string | null;
}
