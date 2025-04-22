// src/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(body: CreateUserDto): Promise<any> {
    const user = await this.authService.validateUser(body);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
