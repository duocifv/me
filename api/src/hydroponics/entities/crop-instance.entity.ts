import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { PlantType } from '../../plant-type/entity/plant-type.entity';
import { Snapshot } from './snapshot.entity';

@Entity()
export class CropInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceId: string;

  @ManyToOne(() => PlantType, (pt) => pt.cropInstances, { nullable: false })
  plantType: PlantType;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Snapshot, (s) => s.cropInstance)
  snapshots: Snapshot[];
}
