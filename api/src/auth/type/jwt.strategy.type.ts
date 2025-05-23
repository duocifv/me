import { Permission } from 'src/permissions/entities/permission.entity';
import { User } from 'src/user/entities/user.entity';

export type JwtStrategyType = User & { permissions: Permission };
