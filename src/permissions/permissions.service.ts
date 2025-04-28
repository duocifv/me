import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { PermissionName } from 'src/permissions/permission.enum'; // Import PermissionName enum
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  // Phương thức tạo quyền mới
  async createPermission(
    permissionName: PermissionName, // Sử dụng PermissionName enum
  ): Promise<Permission> {
    const permission = this.permissionRepository.create({ name: permissionName });
    return this.permissionRepository.save(permission);
  }

  // Lấy tất cả quyền
  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  // Lấy quyền theo tên quyền
  async findPermissionByName(
    permissionName: PermissionName, // Sử dụng PermissionName enum
  ): Promise<Permission> {
    return this.permissionRepository.findOneOrFail({
      where: { name: permissionName },
    });
  }

  // Lấy quyền theo tên quyền
  async findPermissionsByNames(
    permissionNames: PermissionName[], // Sử dụng PermissionName enum
  ): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { name: In(permissionNames) }, // Tìm quyền theo danh sách tên quyền
    });
  }

  // Gán quyền cho vai trò
  async assignPermissionsToRole(
    roleId: number,
    permissionNames: PermissionName[], // Sử dụng PermissionName enum
  ): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Tìm các quyền theo tên quyền trong PermissionName
    const permissions = await this.permissionRepository.find({
      where: { name: In(permissionNames) },
    });

    // Gán quyền cho vai trò
    role.permissions = [...role.permissions, ...permissions];
    await this.roleRepository.save(role);
  }
}
