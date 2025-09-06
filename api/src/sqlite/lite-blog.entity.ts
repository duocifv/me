// src/entities/blog.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class LiteBlog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  intro: string;

  @Column({ type: 'json' })
  items: { title: string; description: string }[];

  @Column({ type: 'text', default: '' })
  markdown: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'json', nullable: true })
  og: {
    image?: string;
    description?: string;
  };

  @Column({ type: 'json', nullable: true })
  metadata: {
    sourceType?: 'local' | 'web';
    modelVersion?: string;
    pipelineVersion?: string;
    keywordDensity?: number;
    [key: string]: any;
  };

  @Column({ nullable: true })
  coverImage: string;

  @CreateDateColumn()
  createdAt: Date;
}
