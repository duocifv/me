import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
} from "typeorm";


@Index("IDX_USER_EMAIL", ["email"], { unique: true })
@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { length: 100, nullable: false })
  name!: string;

  @Column("varchar", { length: 255, nullable: false })
  email!: string;

  @Column("boolean", { default: true, name: "is_active" })
  isActive!: boolean;

  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    type: "timestamp",
    name: "deleted_at",
    nullable: true,
  })
  deletedAt?: Date;

  @VersionColumn({ name: "version" })
  version!: number;
}
