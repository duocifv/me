import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  Body,
  Delete,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignInSchema } from './dto/sign-in.dto';
import { Schema } from 'src/shared/decorators/dto.decorator';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '../shared/decorators/public.decorator';
import { CreateUserDto, CreateUserSchema } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(200)
  @Schema(SignInSchema)
  async login(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const ipAddress = req.getIpAddress();
    const { accessToken, refreshToken, expiresAt } =
      await this.authService.signIn(dto, ipAddress);
    res.setRefreshToken(refreshToken, expiresAt);
    return { accessToken };
  }

  @Post('register')
  @Public()
  @Schema(CreateUserSchema)
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('token')
  @Public()
  @HttpCode(200)
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const value = req.getRefreshToken();
    const ipAddress = req.getIpAddress();

    const { accessToken, refreshToken, expiresAt } =
      await this.authService.refreshTokens(value, ipAddress);

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

  @Delete('logout')
  @HttpCode(204)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    const token = req.cookies?.refreshToken;
    const ipAddress = req.getIpAddress();
    await this.authService.logout(token, ipAddress);
    res.clearCookie('refreshToken', { path: '/' });
    return {
      message: 'Đã đăng xuất',
    };
  }

  @Get('me')
  @HttpCode(200)
  me(@Req() req, @Res({ passthrough: true }) res) {
    return {
      message: 'hello',
    };
  }
}
