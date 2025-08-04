import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AiLogStatus {
  Pending = 'pending',
  Evaluated = 'evaluated',
}

@Entity('schedule_ai_log')
export class LiteAiScheduleLog {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'simple-json' })
  inputEnv: {
    waterTemperature: number;
    ambientTemperature: number;
    humidity: number;
  };

  @Column({ type: 'simple-json' })
  schedule: any; // bạn có thể tạo type riêng nếu muốn chặt chẽ

  @Column('text')
  note: string;

  @Column({ type: 'int', nullable: true })
  reward: number | null;

  @Column({ default: AiLogStatus.Pending })
  status: AiLogStatus;

  // ✅ Cột mới để lưu phản hồi từ người dùng
  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'datetime', nullable: true })
  evaluatedAt?: Date;
}
