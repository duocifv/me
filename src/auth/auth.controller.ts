import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: SignInDto, @Res({ passthrough: true }) res) {
    return this.authService.signIn(dto, res);
  }

  @UseGuards(ThrottlerGuard, AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.refreshTokens(req, res);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.logout(req, res);
  }
}
