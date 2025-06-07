import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './user/users.module';
import { AppService } from './app.service';
import { MediaModule } from './media/media.module';
import { MailModule } from './mail/mail.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
// import { SettingsModule } from './settings/settings.module';
import { User } from './user/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Permission } from './permissions/entities/permission.entity';
// import { DashboardModule } from './dashboard/dashboard.module';
import { CoreModule } from './shared/core.module';
// import { NotificationModule } from './notifications/notification.module';
// import { LogsModule } from './shared/logs/logs.module';
import { AppConfigService } from './shared/config/config.service';
import { APP_GUARD } from '@nestjs/core';
// import { UserRoleSeeder } from './seeder/user-role.seeder';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { PermissionsGuard } from './permissions/permissions.guard';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
// import { TerminusModule } from '@nestjs/terminus';
// import { HttpModule } from '@nestjs/axios';
import { HydroponicsModule } from './hydroponics/hydroponics.module';
import { DeviceConfigModule } from './device/device-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [CoreModule],
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => cfg.typeOrmConfig,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 5,
        },
      ],
    }),
    TypeOrmModule.forFeature([User, Role, Permission]),
    ServeStaticModule.forRoot({
      serveRoot: '/uploads',
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    // TerminusModule,
    // HttpModule,
    CoreModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    MediaModule,
    MailModule,
    HydroponicsModule,
    DeviceConfigModule,
    // SettingsModule,
    // DashboardModule,
    // NotificationModule,
    // LogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // UserRoleSeeder,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// export class AppModule implements OnModuleInit {
//   constructor(private readonly userRoleSeeder: UserRoleSeeder) {}

//   async onModuleInit() {
//     if (process.env.NODE_ENV !== 'production') {
//       await this.userRoleSeeder.onModuleInit();
//     } else {
//       // console.log('Skipping seeding in production environment.');
//     }
//   }
// }
