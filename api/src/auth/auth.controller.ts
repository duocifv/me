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
  Put,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignInSchema } from './dto/sign-in.dto';
import { Schema } from 'src/shared/decorators/dto.decorator';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserDto, CreateUserSchema } from 'src/user/dto/create-user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { Public } from 'src/shared/decorators/public.decorator';
import {
  ChangePasswordDto,
  ChangePasswordSchema,
} from 'src/auth/dto/change-password.dto';
import { MeSchema } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Schema(SignInSchema)
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async login(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const ipAddress = req.getIpAddress();
    const user = req.user as User;
    const { accessToken, refreshToken, expiresAt } =
      await this.authService.signIn(user, ipAddress);
    res.setRefreshToken(refreshToken, expiresAt);
    return { accessToken };
  }

  @Public()
  @Post('register')
  @Schema(CreateUserSchema)
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Public()
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

  @Delete('logout')
  @HttpCode(204)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    const value = req.getRefreshToken();
    const ipAddress = req.getIpAddress();
    await this.authService.logout(value, ipAddress);
    res.clearRefreshToken();
    return {
      message: 'Đã đăng xuất',
    };
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() body: any, @Req() req: any) {
    return { message: 'Reset link sent', user: req.user };
  }

  @Post('reset-password')
  resetPassword(@Body() body: any) {
    return { message: 'Password reset', token: body.token };
  }

  @Get('me')
  // @Permissions(PermissionName.VIEW_USERS)
  @HttpCode(200)
  me(@Req() req, @Res({ passthrough: true }) res) {
    const user = req.user as JwtPayload;
    if (!user) {
      throw new UnauthorizedException('User is not logged in');
    }
    return MeSchema.parse({
      id: user.sub,
      email: user.email,
      role: user.roles,
    });
  }

  @Put('change-password/:id')
  @Schema(ChangePasswordSchema)
  @HttpCode(204)
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(id, dto);
  }
}
