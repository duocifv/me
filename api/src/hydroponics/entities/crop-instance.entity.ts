// src/entity/crop-instance.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PlantType } from '../../plant-type/entity/plant-type.entity';
import { Snapshot } from './snapshot.entity';

@Entity({ name: 'crop_instances' })
export class CropInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceId: string;

  @ManyToOne(() => PlantType, (pt) => pt.cropInstances, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'plantTypeId' })
  plantType: PlantType;

  @Column()
  plantTypeId: number;

  @Column()
  name: string;

  // Timestamp khi tạo
  @CreateDateColumn()
  createdAt: Date;

  // Flag chỉ 1 crop active cho mỗi thiết bị
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Snapshot, (s) => s.cropInstance, {
    cascade: ['insert', 'update', 'remove'],
  })
  snapshots: Snapshot[];
}
