import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';
import { RefreshToken } from './refresh-token.entity';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/user/users.module';
import { JwtStrategy } from './jwt.strategy';
import { AppConfigService } from 'src/core/config/config.service';
import { CoreModule } from 'src/core/core.module';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [CoreModule],
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => cfg.jwtConfig,
    }),
  ],
  providers: [AuthService, TokensService, JwtStrategy,PermissionsGuard],
  controllers: [AuthController],
  exports: [PermissionsGuard, JwtModule],
})
export class AuthModule {}
