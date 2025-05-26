// src/plant-type/entities/plant-type.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CropInstance } from '../../hydroponics/entities/crop-instance.entity';
import { MediaFile } from 'src/media/entities/media.entity';

@Entity()
export class PlantType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  mediaFileId?: string;

  @ManyToOne(() => MediaFile, (media) => media.plantTypes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'mediaFileId' })
  mediaFile?: MediaFile;

  @OneToMany(() => CropInstance, (ci) => ci.plantType)
  cropInstances: CropInstance[];
}
