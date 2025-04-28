import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { PermissionName } from 'src/permissions/permission.enum'; // Import PermissionName enum

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PermissionName,
    unique: true, // Nếu bạn muốn các giá trị này không bị trùng trong DB
  })
  name: PermissionName; // Ánh xạ trực tiếp với PermissionName enum

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[]; // Quan hệ nhiều-nhiều với Role
}
