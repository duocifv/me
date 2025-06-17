// src/entities/decision.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Snapshot } from './snapshot.entity';

@Entity()
export class Decision {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('json')
  result: any;

  @ManyToOne(() => Snapshot, (snapshot) => snapshot.decisions)
  snapshot: Snapshot;
}
