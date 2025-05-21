import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Roles } from 'src/roles/dto/role.enum';
import bcrypt from 'bcryptjs';
import { PermissionName } from 'src/permissions/permission.enum';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class UserRoleSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  // Phương thức khởi tạo seeder
  async onModuleInit() {
    await this.seedPermissionsAndAssignToAdmin();
    await this.seedRoles();
    await this.seedAdminUser();
  }

  // Seeder cho Permissions
  private async seedPermissionsAndAssignToAdmin() {
    const permissionNames = Object.values(PermissionName);

    const permissions: Permission[] = [];

    for (const name of permissionNames) {
      let permission = await this.permissionRepo.findOneBy({ name });
      if (!permission) {
        permission = this.permissionRepo.create({ name });
        permission = await this.permissionRepo.save(permission);
      }
      permissions.push(permission);
    }

    // Gán permissions cho role ADMIN
    const adminRole = await this.roleRepo.findOne({
      where: { name: Roles.ADMIN },
      relations: ['permissions'],
    });

    if (adminRole) {
      // Gộp & loại trùng
      const merged = [
        ...adminRole.permissions,
        ...permissions.filter(
          (p) =>
            !adminRole.permissions.some((existing) => existing.id === p.id),
        ),
      ];
      adminRole.permissions = merged;
      await this.roleRepo.save(adminRole);
    } else {
      throw new NotFoundException(
        'ADMIN role not found. Cannot assign permissions.',
      );
    }
  }

  // Seeder cho Roles
  private async seedRoles() {
    const roleNames = Object.values(Roles);

    for (const name of roleNames) {
      const exist = await this.roleRepo.findOne({
        where: { name },
        relations: ['permissions'],
      });

      if (!exist) {
        const permissions = await this.permissionRepo.find();
        const role = this.roleRepo.create({
          name,
          permissions: name === Roles.ADMIN ? permissions : [],
        });
        await this.roleRepo.save(role);
      }
    }
  }

  // Seeder cho Admin User
  private async seedAdminUser() {
    const exist = await this.userRepo.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!exist) {
      const hash = await bcrypt.hash('string', 10);

      // Tạo Admin User
      const adminUser = this.userRepo.create({
        email: 'admin@example.com',
        password: hash,
      });

      const adminRole = await this.roleRepo.findOne({
        where: { name: Roles.ADMIN },
      });

      if (adminRole) {
        adminUser.roles = [adminRole];
        await this.userRepo.save(adminUser);
      } else {
        throw new NotFoundException(
          'Admin role not found, skipping admin user creation',
        );
      }
    }
  }
}
