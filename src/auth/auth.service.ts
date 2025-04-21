import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import bcrypt from 'bcryptjs';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  login(user: User) {
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  refresh(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    return this.login({ id: payload.sub, username: payload.username });
  }
}
