// permissions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import {
  PermissionAction,
  PermissionResource,
} from 'src/permissions/permission.enum';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Phương thức tạo quyền mới
  async createPermission(
    action: PermissionAction,
    resource: PermissionResource,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create({ action, resource });
    return this.permissionRepository.save(permission);
  }

  // Lấy tất cả quyền
  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  // Lấy quyền theo tên tài nguyên và hành động
  async findPermissionByActionAndResource(
    action: PermissionAction,
    resource: PermissionResource,
  ): Promise<Permission> {
    return this.permissionRepository.findOneOrFail({
      where: { action, resource },
    });
  }

  // Lấy tất cả quyền theo tên tài nguyên
  async findPermissionsByResource(
    resource: PermissionResource,
  ): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { resource },
    });
  }

  // Gán quyền cho vai trò
  async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });

    role.permissions = [...role.permissions, ...permissions];
    await this.roleRepository.save(role);
  }
}
