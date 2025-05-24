import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class DeviceTokenGuard implements CanActivate {
  private readonly DEVICE_TOKEN = 'esp32';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-device-token'];
    const deviceId = request.headers['x-device-id'];

    if (token !== this.DEVICE_TOKEN) {
      throw new UnauthorizedException('Invalid device token');
    }

    if (!deviceId) {
      throw new UnauthorizedException('Missing device ID');
    }

    // Gán deviceId vào request để controller sử dụng
    request.deviceId = deviceId;
    return true;
  }
}
