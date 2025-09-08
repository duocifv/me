// sqlite/lite-embedding.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lite_embedding')
export class LiteEmbedding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column('text')
  vector: string;
}
