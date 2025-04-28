import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { Permission } from 'src/permissions/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission]), PermissionsModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
