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
@Index('IDX_IMAGE_SNAPSHOT', ['snapshotId'])
export class CameraImage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Snapshot, (snapshot) => snapshot.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'snapshot_id' })
  snapshot: Snapshot;

  @Column({ name: 'snapshot_id', type: 'bigint' })
  snapshotId: number;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath: string;

  @Column({ name: 'size', type: 'int', nullable: true })
  size: number;
}
