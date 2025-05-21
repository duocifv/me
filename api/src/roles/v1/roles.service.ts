import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindManyOptions, FindOneOptions } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { PermissionName } from 'src/permissions/dto/permission.enum';
import { NotFoundException } from '@nestjs/common';
import { UpdateRoleDto } from '../dto/update-role.dto';

import { Roles } from '../dto/role.enum';
import { RoleFullDto } from '../dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  private readonly fullRoleOptions: Pick<
    FindManyOptions<Role>,
    'relations' | 'select'
  > &
    Pick<FindOneOptions<Role>, 'where'> = {
    relations: ['permissions', 'users'],
    select: {
      id: true,
      name: true,
      description: true,
      permissions: { id: true, name: true },
      users: { id: true, email: true },
    },
  } as any;

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

  async findAll(): Promise<RoleFullDto[]> {
    return this.roleRepo.find({
      relations: this.fullRoleOptions.relations,
      select: this.fullRoleOptions.select,
    });
  }

  async findById(id: string): Promise<RoleFullDto> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: this.fullRoleOptions.relations,
      select: this.fullRoleOptions.select,
    });
    if (!role) {
      throw new NotFoundException(`Role with id '${id}' not found`);
    }
    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const { permissions: permissionIds } = dto;
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Role with id '${id}' not found`);
    }

    if (permissionIds) {
      const permissions = await this.permissionRepo.find({
        where: { id: In(permissionIds) },
      });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException(`Invalid permission IDs`);
      }
      role.permissions = permissions;
    }
    return this.roleRepo.save(role);
  }

  // /** Create a new role, error if duplicate */
  // async create(dto: CreateRoleDto): Promise<RoleFullDto> {
  //   const exists = await this.roleRepo.findOne({ where: { name: dto.name } });
  //   if (exists) {
  //     throw new ConflictException(
  //       `Role with name '${dto.name}' already exists`,
  //     );
  //   }
  //   const role = this.roleRepo.create(dto);
  //   const saved = await this.roleRepo.save(role);
  //   return this.findOne(saved.id);
  // }
  // /** Remove a role by id */
  // async remove(id: string): Promise<void> {
  //   const role = await this.roleRepo.findOne({ where: { id } });
  //   if (!role) {
  //     throw new NotFoundException(`Role with id '${id}' not found`);
  //   }
  //   await this.roleRepo.remove(role);
  // }
}
