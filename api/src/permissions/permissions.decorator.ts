import { SetMetadata } from '@nestjs/common';
import { PermissionName } from './dto/permission.enum';

export const Permissions = (...perms: PermissionName[]) =>
  SetMetadata('permissions', perms);
