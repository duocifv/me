import { SetMetadata } from '@nestjs/common';
import {
  PermissionAction,
  PermissionResource,
} from '../../permissions/permission.enum';

export const Permissions = (
  action: PermissionAction,
  resource: PermissionResource,
) => SetMetadata('action', action) && SetMetadata('resource', resource);
