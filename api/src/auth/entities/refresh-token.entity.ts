import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: false })
  revoked: boolean;

  @Column({ nullable: true })
  fingerprint: string;

  @Column()
  tokenHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
