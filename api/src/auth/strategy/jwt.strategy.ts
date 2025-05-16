import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import * as path from 'path';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from 'src/user/users.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { User } from 'src/user/entities/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { JwtStrategyType } from '../interfaces/jwt.strategy.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly permissionService: PermissionsService,
  ) {
    const publicKeyPath = path.resolve('certs/public.pem');
    if (!fs.existsSync(publicKeyPath)) {
      throw new Error(`Public key not found at path: ${publicKeyPath}`);
    }
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    const issuer = process.env.JWT_ISSUER;
    const audience = process.env.JWT_AUDIENCE;

    if (!issuer || !audience) {
      throw new Error('Missing JWT issuer or audience environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      issuer,
      audience,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findBySub(payload.sub);
    console.log('ping---->', user);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
