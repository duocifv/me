import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Roles } from 'src/roles/role.enum';
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
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedAdminUser();
  }

  // Seeder cho Permissions
  private async seedPermissions() {
    const permissionNames = Object.values(PermissionName);

    for (const name of permissionNames) {
      const exist = await this.permissionRepo.findOneBy({ name });
      if (!exist) {
        const permission = this.permissionRepo.create({ name });
        await this.permissionRepo.save(permission);
        console.log(`Permission created: ${name}`);
      }
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
        console.log(`Role created: ${name}`);
      }
    }
  }

  // Seeder cho Admin User
  private async seedAdminUser() {
    const exist = await this.userRepo.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!exist) {
      const hash = await bcrypt.hash('adminpassword', 10); // Mật khẩu mặc định

      // Tạo Admin User
      const adminUser = this.userRepo.create({
        email: 'admin@example.com',
        password: hash,
      });

      const adminRole = await this.roleRepo.findOne({ where: { name: Roles.ADMIN } });
      
      if (adminRole) {
        adminUser.roles = [adminRole];
        await this.userRepo.save(adminUser);
        console.log('Admin user created');
      } else {
        console.log('Admin role not found, skipping admin user creation');
      }
    }
  }
}
