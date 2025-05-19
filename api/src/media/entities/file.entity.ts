import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'media_files' })
export class MediaFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-json' })
  variants: Record<'thumbnail' | 'medium' | 'large', string>;

  @Column()
  mimetype: string;

  @Column('int')
  size: number;

  @CreateDateColumn()
  createdAt: Date;
}
