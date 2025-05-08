import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { PermissionName } from 'src/permissions/permission.enum'; 

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PermissionName,
    unique: true,
  })
  name: PermissionName;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
