import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard'; // Sử dụng guard JWT đã tạo
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum'; // Thêm enum Role để xác định các vai trò

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler()); // Lấy roles từ metadata của handler
    if (!roles) {
      return true; // Nếu không có phân quyền, cho phép truy cập
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return roles.includes(user.role); // Kiểm tra xem người dùng có đủ quyền không
  }
}
