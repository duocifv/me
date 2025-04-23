// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity({ name: "users" })
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;
}
