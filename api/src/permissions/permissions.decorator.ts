import { SetMetadata } from '@nestjs/common';
import { PermissionName } from './permission.enum';

export const Permissions = (...perms: PermissionName[]) =>
  SetMetadata('permissions', perms);
