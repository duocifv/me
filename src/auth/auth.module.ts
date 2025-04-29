import { forwardRef, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/user/users.module';
import { AppConfigService } from 'src/shared/config/config.service';
import { CoreModule } from 'src/shared/core.module';
import { AuthGuard } from './guard/jwt.guard';
import { RolesGuard } from './guard/roles.guard';
import { PermissionsGuard } from './guard/permissions.guard';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [CoreModule],
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => cfg.jwtConfig,
    }),
    forwardRef(() => UsersModule),
    AppConfigService
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensService,
    JwtService,
    RolesGuard,
    PermissionsGuard,
    AuthGuard,
    JwtStrategy,
  ],
  exports: [JwtModule, JwtStrategy, AuthGuard, RolesGuard, PermissionsGuard],
})
export class AuthModule { }
