import { getRepository } from 'typeorm';
import { Permission } from '../auth/entities/permission.entity';
import { Role } from '../roles/role.entity';
import { User } from '../auth/entities/user.entity';
import {
  PermissionAction,
  PermissionResource,
} from 'src/permissions/permission.enum';

async function seed() {
  const permissionRepo = getRepository(Permission);
  const roleRepo = getRepository(Role);
  const userRepo = getRepository(User);

  // Tạo các quyền
  const permissions = [
    { action: PermissionAction.CREATE, resource: PermissionResource.ARTICLE },
    { action: PermissionAction.READ, resource: PermissionResource.ARTICLE },
    { action: PermissionAction.UPDATE, resource: PermissionResource.ARTICLE },
    { action: PermissionAction.DELETE, resource: PermissionResource.ARTICLE },
    // Thêm các quyền khác nếu cần
  ];

  const permissionEntities = permissionRepo.create(permissions);
  await permissionRepo.save(permissionEntities);

  // Tạo vai trò admin
  const adminRole = roleRepo.create({
    name: 'admin',
    description: 'Administrator role',
    permissions: permissionEntities,
  });
  await roleRepo.save(adminRole);

  // Tạo người dùng admin
  const adminUser = userRepo.create({
    email: 'admin@example.com',
    password: 'hashed_password', // Đảm bảo mật khẩu được hash
    roles: [adminRole],
  });
  await userRepo.save(adminUser);

  console.log('Seed dữ liệu thành công');
}

seed().catch((error) => console.error(error));
