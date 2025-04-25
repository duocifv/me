import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { PermissionAction, PermissionResource } from './permission.enum';
import { Role } from 'src/roles/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @Column({
    type: 'enum',
    enum: PermissionResource,
  })
  resource: PermissionResource;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
