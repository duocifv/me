import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import * as path from 'path';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
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

  validate(payload: JwtPayload): JwtPayload {
    // In ra kiểm tra
    console.log('JWT Payload:--->', payload);

    // Trả về nguyên payload, bao gồm permissions
    return payload;
  }
}
