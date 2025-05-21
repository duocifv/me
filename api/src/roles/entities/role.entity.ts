import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  JoinTable,
  BeforeInsert,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Roles } from '../dto/role.enum';
import { v4 as uuidv4 } from 'uuid';

@Entity('roles')
export class Role {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @Column({ unique: true, default: Roles.GUEST })
  name: Roles;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
