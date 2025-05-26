import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Variants } from '../type/media-variants.type';
import { MediaLabel } from '../type/media-label.type';
import { MediaCategory } from '../type/media-category.type';
import { PlantType } from 'src/plant-type/entity/plant-type.entity';

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

  @OneToMany(() => PlantType, (pt) => pt.mediaFile)
  plantTypes: PlantType[];

  @CreateDateColumn()
  createdAt: Date;
}
