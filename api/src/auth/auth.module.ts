import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './services/auth.service';
import { TokensService } from './services/tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/user/users.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { CoreModule } from 'src/shared/core.module';
import { AppConfigService } from 'src/shared/config/config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
    PassportModule,
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
    JwtStrategy,
    JwtService,
    LocalStrategy,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
