import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Permissions } from 'src/permissions/permissions.decorator';
import { PermissionName } from 'src/permissions/permission.enum';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /** Xem tất cả thông báo */
  @Get()
  @Permissions(PermissionName.VIEW_NOTIFICATIONS)
  findAll() {
    return this.notificationService.findAll();
  }

  /** Xem chi tiết một thông báo */
  @Get(':id')
  @Permissions(PermissionName.VIEW_NOTIFICATIONS)
  findOne(@Param('id') id: number) {
    return this.notificationService.findOne(id);
  }

  /** Tạo mới thông báo */
  @Post()
  @Permissions(PermissionName.MANAGE_NOTIFICATIONS)
  create(@Body() body: any) {
    return this.notificationService.create(body);
  }

  /** Cập nhật thông báo */
  @Put(':id')
  @Permissions(PermissionName.MANAGE_NOTIFICATIONS)
  update(@Param('id') id: number, @Body() body: any) {
    return this.notificationService.update(id, body);
  }

  /** Xóa thông báo */
  @Delete(':id')
  @Permissions(PermissionName.MANAGE_NOTIFICATIONS)
  remove(@Param('id') id: number) {
    return this.notificationService.remove(id);
  }
}
