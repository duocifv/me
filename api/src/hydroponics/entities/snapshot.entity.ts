import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { CropInstance } from './crop-instance.entity';
import { CameraImage } from './camera-image.entity';

@Entity()
export class Snapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CropInstance, (ci) => ci.snapshots, { nullable: false })
  cropInstance: CropInstance;

  @CreateDateColumn()
  timestamp: Date;

  @Column('json')
  sensorData: Record<string, any>;

  @Column('json')
  solutionData: Record<string, any>;

  @OneToMany(() => CameraImage, (img) => img.snapshot)
  images: CameraImage[];
}
