import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Snapshot } from './snapshot.entity';

@Entity()
export class CameraImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Snapshot, (s) => s.images, { onDelete: 'CASCADE' })
  snapshot: Snapshot;

  @Column()
  url: string;

  @Column({ nullable: true })
  label?: string;

  @CreateDateColumn()
  timestamp: Date;
}
