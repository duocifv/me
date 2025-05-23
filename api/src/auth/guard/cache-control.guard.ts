import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class NoCacheGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // const res = context.switchToHttp().getResponse();
    // // Gắn header chống cache
    // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    // res.setHeader('Pragma', 'no-cache');
    // res.setHeader('Expires', 'Thu, 01 Dec 1994 16:00:00 GMT');
    return true;
  }
}
