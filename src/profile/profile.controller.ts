import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard'; // Guard phân quyền
import { Roles } from '../auth/roles.decorator'; // Decorator phân quyền
import { Role } from '../auth/role.enum'; // Enum role
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard) // Bảo vệ với cả JwtAuthGuard và RolesGuard
  @Roles(Role.User) // Chỉ người dùng có vai trò User mới truy cập được
  getMyProfile() {
    return { message: 'This is your protected profile page.' };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin) // Chỉ người dùng có vai trò Admin mới truy cập được
  getAdminPage() {
    return { message: 'This is the admin page.' };
  }
}
