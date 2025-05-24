import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CropInstance } from '../../hydroponics/entities/crop-instance.entity';

@Entity()
export class PlantType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  displayName: string;

  @OneToMany(() => CropInstance, (ci) => ci.plantType)
  cropInstances: CropInstance[];
}
