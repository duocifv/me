import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { PermissionName } from 'src/permissions/permission.enum';
import { NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { Roles } from './dto/role.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async findRoleByName(name: Roles): Promise<Role> {
    return this.roleRepo.findOneOrFail({
      where: { name },
      relations: ['permissions'],
    });
  }

  async assignPermissionsToRole(
    role: Role,
    permissions: Permission[],
  ): Promise<void> {
    role.permissions = permissions;
    await this.roleRepo.save(role);
  }

  async findPermissionsByNames(names: PermissionName[]): Promise<Permission[]> {
    return this.permissionRepo.find({
      where: {
        name: In(names),
      },
    });
  }
  async create(dto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepo.create(dto);
    return this.roleRepo.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find({ relations: ['permissions', 'users'] });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });
    if (!role) throw new NotFoundException(`Role #${id} not found`);
    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepo.remove(role);
  }
}
