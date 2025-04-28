import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryColumn('uuid')
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
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
