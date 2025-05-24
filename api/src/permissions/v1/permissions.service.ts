import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { PermissionName } from 'src/permissions/dto/permission.enum';
import { Role } from 'src/roles/entities/role.entity';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  findAll(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepo.findOneBy({ id });
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return permission;
  }

  async findByName(name: PermissionName): Promise<Permission | null> {
    return this.permissionRepo.findOneBy({ name });
  }

  async update(
    id: string,
    { name }: UpdatePermissionDto,
  ): Promise<Permission | null> {
    const permission = await this.permissionRepo.findOneBy({ id });
    if (!permission) return null;

    permission.name = name;
    return this.permissionRepo.save(permission);
  }
  async create({ name }: CreatePermissionDto): Promise<Permission> {
    const existing = await this.findByName(name);
    if (existing) return existing;

    const permission = this.permissionRepo.create({ name });
    return this.permissionRepo.save(permission);
  }

  async delete(id: string): Promise<void> {
    const result = await this.permissionRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
  }

  // Lấy quyền theo tên quyền
  async findPermissionByName(
    permissionName: PermissionName, // Sử dụng PermissionName enum
  ): Promise<Permission> {
    return this.permissionRepo.findOneOrFail({
      where: { name: permissionName },
    });
  }

  // Lấy quyền theo tên quyền
  async findPermissionsByNames(
    permissionNames: PermissionName[],
  ): Promise<Permission[]> {
    return this.permissionRepo.find({
      where: { name: In(permissionNames) },
    });
  }

  // Gán quyền cho vai trò
  async assignPermissionsToRole(
    roleId: string,
    permissionNames: PermissionName[],
  ): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    const permissions = await this.permissionRepo.find({
      where: { name: In(permissionNames) },
    });

    role.permissions = [...role.permissions, ...permissions];
    await this.roleRepository.save(role);
  }
}
