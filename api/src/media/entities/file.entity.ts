import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Variants } from '../type/media-variants.type';
import { MediaLabel } from '../type/media-label.type';
import { MediaCategory } from '../type/media-category.type';

@Entity({ name: 'media_files' })
export class MediaFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'simple-json' })
  variants: Variants;

  @Column()
  mimetype: string;

  @Column({ type: 'simple-json', nullable: true })
  labels?: MediaLabel[];

  @Column('int')
  size: number;

  @Column({ type: 'simple-json', nullable: true })
  category?: MediaCategory[];

  @CreateDateColumn()
  createdAt: Date;
}
