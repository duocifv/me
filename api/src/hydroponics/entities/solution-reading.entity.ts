// src/entity/solution-reading.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Snapshot } from './snapshot.entity';

@Entity({ name: 'solution_readings' })
@Index('IDX_SOLUTION_SNAPSHOT_TIME', ['snapshotId', 'recordedAt'])
@Index('IDX_SOLUTION_PARAM_TIME', ['paramKey', 'recordedAt'])
export class SolutionReading {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Snapshot, (s) => s.solutionReadings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'snapshotId' })
  snapshot: Snapshot;

  @Column({ type: 'bigint' })
  snapshotId: number;

  @Column({ type: 'varchar', length: 50 })
  @Index('IDX_SOLUTION_KEY')
  paramKey: string;

  @Column({ type: 'double precision' })
  paramValue: number;

  @CreateDateColumn({ type: 'timestamp' })
  @Index('IDX_SOLUTION_TIME')
  recordedAt: Date;
}
