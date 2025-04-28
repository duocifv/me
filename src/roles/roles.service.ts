import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { PermissionName } from 'src/permissions/permission.enum'; // Import PermissionName
import { RoleName } from './role.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // Lấy vai trò theo tên
  async findRoleByName(name: RoleName): Promise<Role> {
    return this.roleRepository.findOneOrFail({
      where: { name },
      relations: ['permissions'],
    });
  }

  // Gán quyền cho vai trò
  async assignPermissionsToRole(
    role: Role,
    permissions: Permission[],
  ): Promise<void> {
    role.permissions = permissions; // Gán quyền cho vai trò
    await this.roleRepository.save(role); // Lưu vai trò với quyền mới
  }

  // Tìm quyền từ PermissionName
  async findPermissionsByNames(names: PermissionName[]): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: {
        name: In(names), // Dùng In để tìm các quyền có tên trong mảng
      },
    });
  }
}
