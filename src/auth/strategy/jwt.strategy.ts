import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const publicKey = fs.readFileSync(
      path.resolve('certs/public.pem'),
      'utf8',
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      issuer: process.env.JWT_ISSUER!,
      audience: process.env.JWT_AUDIENCE!,
      algorithms: ['RS256'],
    });
  }

  validate(payload) {
    console.log('JWT Payload:--->', payload);
    return { userId: payload.sub, roles: payload.roles, email: payload.email };
  }
}
