// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { AppDataSource } from './config/typeorm.config';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { DemoModule } from './demo/demo.module';

@Module({
  imports: [
    // Load .env và làm global
    ConfigModule.forRoot({ isGlobal: true }),

    // Cấu hình TypeORM theo AppDataSource
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        ...AppDataSource.options,
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),

    AuthModule,
    UsersModule,
    DemoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Áp dụng JWT Guard cho mọi route
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Áp dụng Roles Guard cho mọi route có @Roles()
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
