import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import * as path from 'path';
import { JwtPayload } from '../interfaces/jwt-payload.type';
import { UsersService } from 'src/user/v1/users.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
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
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
