import { SetMetadata } from '@nestjs/common';
import { Role } from './role.enum'; // Import enum Role

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles); // Đặt metadata cho handler
