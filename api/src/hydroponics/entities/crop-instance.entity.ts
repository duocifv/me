// src/entity/crop-instance.entity.ts
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
import { PlantType } from '../../plant-type/entity/plant-type.entity';
import { Snapshot } from './snapshot.entity';

@Entity({ name: 'crop_instances' })
export class CropInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  @Index('IDX_CROP_DEVICE')
  deviceId: string;

  @ManyToOne(() => PlantType, (pt) => pt.cropInstances, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'plantTypeId' })
  plantType: PlantType;

  @Column()
  @Index('IDX_CROP_PLANTTYPE')
  plantTypeId: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Snapshot, (s) => s.cropInstance, {
    cascade: ['insert', 'update', 'remove'],
  })
  snapshots: Snapshot[];
}
