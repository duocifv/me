import { Entity, PrimaryColumn, Column, ManyToMany, BeforeInsert } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { PermissionName } from 'src/permissions/dto/permission.enum';
import { v4 as uuidv4 } from 'uuid';

@Entity('permissions')
export class Permission {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @Column({
    type: 'enum',
    enum: PermissionName,
    unique: true,
  })
  name: PermissionName;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
