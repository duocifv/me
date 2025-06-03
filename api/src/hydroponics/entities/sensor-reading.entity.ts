// src/entity/sensor-reading.entity.ts
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

@Entity({ name: 'sensor_readings' })
@Index('IDX_SENSOR_SNAPSHOT_TIME', ['snapshotId', 'recordedAt'])
@Index('IDX_SENSOR_METRIC_TIME', ['metricKey', 'recordedAt'])
export class SensorReading {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Snapshot, (s) => s.sensorReadings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'snapshotId' })
  snapshot: Snapshot;

  @Column({ type: 'bigint' })
  snapshotId: number;

  @Column({ type: 'varchar', length: 50 })
  @Index('IDX_SENSOR_KEY')
  metricKey: string;

  @Column({ type: 'double precision' })
  metricValue: number;

  @CreateDateColumn({ type: 'timestamp' })
  @Index('IDX_SENSOR_TIME')
  recordedAt: Date;
}
