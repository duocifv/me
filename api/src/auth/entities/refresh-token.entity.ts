import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class RefreshToken {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

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
