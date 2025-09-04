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
  
    @CreateDateColumn()
    createdAt: Date;
  }
  