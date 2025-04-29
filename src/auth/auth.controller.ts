import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  Body,
  Delete,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignInSchema } from './dto/sign-in.dto';
import { Schema } from 'src/shared/decorators/dto.decorator';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserDto, CreateUserSchema } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { Public } from 'src/shared/decorators/public.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @Schema(SignInSchema)
  async login(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const ipAddress = req.getIpAddress();
    const user = req.user as User;
    const { accessToken, refreshToken, expiresAt } =
      await this.authService.signIn(user , ipAddress);
    res.setRefreshToken(refreshToken, expiresAt);
    return { accessToken };
  }

  @Post('register')
  @Schema(CreateUserSchema)
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('token')
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
  forgotPassword(@Body() body: any, @Req() req: any) {
    console.log('User from JWT:', req.user);

    return { message: 'Reset link sent', user: req.user };
  }


  @Post('reset-password')
  resetPassword(@Body() body: any) {
    return { message: 'Password reset', token: body.token };
  }


  @UseGuards(JwtAuthGuard)
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
