import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Permissions } from 'src/permissions/permissions.decorator';
import { PermissionName } from 'src/permissions/permission.enum';
import {
  CreateNotificationDto,
  createNotificationSchema,
} from './dto/create-notification.dto';
import {
  UpdateNotificationDto,
  updateNotificationSchema,
} from './dto/update-notification.dto';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Permissions(PermissionName.VIEW_NOTIFICATIONS)
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  @Permissions(PermissionName.VIEW_NOTIFICATIONS)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.findOne(id);
  }

  @Post()
  @Permissions(PermissionName.MANAGE_NOTIFICATIONS)
  create(@BodySchema(createNotificationSchema) dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Put(':id')
  @Permissions(PermissionName.MANAGE_NOTIFICATIONS)
  update(
    @Param('id', ParseIntPipe) id: number,
    @BodySchema(updateNotificationSchema) dto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(PermissionName.MANAGE_NOTIFICATIONS)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.remove(id);
  }
}
