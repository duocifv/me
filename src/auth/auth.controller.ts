import {
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignInSchema } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Schema } from 'src/common/decorators/dto.decorator';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Schema(SignInSchema)
  async login(@Body() dto: SignInDto, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken, expiresAt } =
      await this.authService.signIn(dto);

    res.setRefreshToken(refreshToken, expiresAt);
    return { accessToken };
  }

  @Post('token')
  @HttpCode(200)
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const value = req.getRefreshToken();

    const { accessToken, refreshToken, expiresAt } =
      await this.authService.refreshTokens(value);

    res.setRefreshToken(refreshToken, expiresAt);
    return { accessToken };
  }

  @UseGuards(ThrottlerGuard, AuthGuard('jwt-refresh'))
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.logout(req, res);
  }
}
