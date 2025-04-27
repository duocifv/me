import {
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  Body,
  Delete,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignInSchema } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Schema } from 'src/shared/decorators/dto.decorator';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from './decorator/public.decorator';
import { Roles } from './decorator/roles.decorator';
import { Permissions } from './decorator/permissions.decorator';
import { Scopes } from './decorator/scopes.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  @HttpCode(200)
  @Schema(SignInSchema)
  async login(@Body() dto: SignInDto, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken, expiresAt } =
      await this.authService.signIn(dto);

    res.setRefreshToken(refreshToken, expiresAt);
    return { accessToken };
  }

  @Public()
  @Permissions('create:posts')
  @Scopes('write:posts')
  @Roles('admin')
  @Roles('admin', 'user')
  @Post('register')
  register(@Body() body: any) {
    return { message: 'User registered', data: body };
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

  @Post('forgot-password')
  forgotPassword(@Body() body: any) {
    return { message: 'Reset link sent', email: body.email };
  }

  @Post('reset-password')
  resetPassword(@Body() body: any) {
    return { message: 'Password reset', token: body.token };
  }

  @UseGuards(ThrottlerGuard, AuthGuard('jwt-refresh'))
  @Delete('logout')
  @HttpCode(204)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.logout(req, res);
  }

  @UseGuards(ThrottlerGuard, AuthGuard('jwt-refresh'))
  @Get('me')
  @HttpCode(200)
  async me(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.logout(req, res);
  }
}
