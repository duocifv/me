// roles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // Lấy vai trò theo tên
  async findRoleByName(name: string): Promise<Role> {
    return this.roleRepository.findOneOrFail({
      where: { name },
      relations: ['permissions'],
    });
  }

  // Phương thức gán quyền cho vai trò
  async assignPermissionsToRole(
    role: Role,
    permissions: Permission[],
  ): Promise<void> {
    role.permissions = permissions; // Gán quyền cho vai trò
    await this.roleRepository.save(role); // Lưu vai trò với quyền mới
  }

  // Lấy quyền từ tên
  async findPermissionsByNames(names: string[]): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: names.map((name) => ({ name })),
    });
  }
}
