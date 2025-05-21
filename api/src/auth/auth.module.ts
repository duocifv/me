import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './v1/auth.service';
import { TokensService } from './v1/tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthController } from './v1/auth.controller';
import { UsersModule } from 'src/user/users.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { CoreModule } from 'src/shared/core.module';
import { AppConfigService } from 'src/shared/config/config.service';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { AccountSecurityService } from './v1/account-security.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    UsersModule,
    PassportModule,
    PermissionsModule,
    JwtModule.registerAsync({
      imports: [CoreModule],
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => ({
        privateKey: cfg.jwtConfig.privateKey,
        publicKey: cfg.jwtConfig.publicKey,
        signOptions: cfg.jwtConfig.signOptions,
        verifyOptions: {
          algorithms: ['RS256'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensService,
    AccountSecurityService,
    JwtStrategy,
    JwtService,
    LocalStrategy,
  ],
  exports: [AuthService, AccountSecurityService, JwtStrategy],
})
export class AuthModule {}
