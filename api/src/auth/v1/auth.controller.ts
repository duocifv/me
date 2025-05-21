import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  Delete,
  Get,
  UseGuards,
  Put,
  Param,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserDto, CreateUserSchema } from 'src/user/dto/create-user.dto';
import { LocalAuthGuard } from '../guard/local-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { Public } from 'src/shared/decorators/public.decorator';
import {
  ChangePasswordDto,
  ChangePasswordSchema,
} from 'src/auth/dto/change-password.dto';
import { MeSchema } from '../dto/login.dto';
import { SignInDto, SignInSchema } from '../dto/sign-in.dto';
import { DeviceHeader } from 'src/shared/decorators/device-header.decorator';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import { Throttle } from '@nestjs/throttler';
import {
  ForgotPasswordDto,
  ForgotPasswordSchema,
} from '../dto/forgot-password.dto';
import {
  ResetPasswordDto,
  ResetPasswordSchema,
} from '../dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @DeviceHeader()
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async login(
    @Headers('X-Device-Fingerprint') fingerprint: string,
    @BodySchema(SignInSchema) dto: SignInDto,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const user = req.user as User;
    const { accessToken, refreshToken, expiresAt } =
      await this.authService.signIn(user, fingerprint);
    res.setCookieRefreshToken(refreshToken, expiresAt, user.id);
    return { accessToken };
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('register')
  register(@BodySchema(CreateUserSchema) dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @DeviceHeader()
  @Public()
  @Post('token')
  @HttpCode(200)
  async refresh(
    @Headers('X-Device-Fingerprint') fingerprint: string,
    // @Headers('X-User-Id') user_id: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const cookieRefreshToken = req.getCookieRefreshToken();
    const { accessToken, refreshToken, expiresAt, userId } =
      await this.authService.refreshTokens(cookieRefreshToken, fingerprint);

    res.setCookieRefreshToken(refreshToken, expiresAt, userId);
    return { accessToken };
  }

  @DeviceHeader()
  @Delete('logout')
  @HttpCode(200)
  async logout(
    @Headers('X-Device-Fingerprint') fingerprint: string,
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    const refreshToken = req.getCookieRefreshToken();
    await this.authService.logout(refreshToken, fingerprint);
    res.clearCookieRefreshToken();
    return 'logout-ok';
  }

  @Post('forgot-password')
  async forgotPassword(
    @BodySchema(ForgotPasswordSchema) dto: ForgotPasswordDto,
  ) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If your email exists, a reset link has been sent.' };
  }

  @Post('reset-password')
  async resetPassword(@BodySchema(ResetPasswordSchema) dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password reset successfully' };
  }

  @Get('me')
  // @Permissions(PermissionName.VIEW_USERS)
  @HttpCode(200)
  me(@Req() req) {
    const user = req.user as User;
    if (!user) {
      throw new UnauthorizedException('User is not logged in');
    }
    // const permissions = roles
    //   .flatMap((r) => r.permissions || [])
    //   .map((p) => p.name);
    const roleNames = user.roles.map((r) => r.name);
    return MeSchema.parse({
      id: user.id,
      email: user.email,
      role: roleNames,
    });
  }

  @Put('change-password/:id')
  @HttpCode(204)
  async changePassword(
    @Param('id') id: string,
    @BodySchema(ChangePasswordSchema) dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(id, dto);
  }
}
