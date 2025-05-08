import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { Permission } from 'src/permissions/entities/permission.entity';
import { RolesGuard } from './roles.guard';
import { RoleController } from './roles.controller';
import { RoleService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission]), PermissionsModule],
  controllers: [RoleController],
  providers: [RoleService, RolesGuard],
  exports: [RoleService, RolesGuard],
})
export class RolesModule {}
