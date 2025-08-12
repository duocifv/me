import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class LiteMedical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  analysisResult: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
