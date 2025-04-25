import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './user/users.module';
import { AppService } from './app.service';
import { FileModule } from './media/media.module';
import { MailModule } from './mail/mail.module';
import { AccessControlModule } from 'nest-access-control';
import { roles } from './app.roles';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { SettingsModule } from './settings/settings.module';
import { HomeModule } from './pages/home/home.module';
import { AboutModule } from './pages/about/about.module';
import { ContactModule } from './pages/contact/contact.module';
import { User } from './user/user.entity';
import { Role } from './roles/role.entity';
import { Permission } from './permissions/permission.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { CoreModule } from './core/core.module';
import { NotificationModule } from './notification/notification.module';
import { LogsModule } from './logs/logs.module';
import { AppConfigService } from './core/config/config.service';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './auth/permissions.guard';

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
    AccessControlModule.forRoles(roles),
    CoreModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    FileModule,
    MailModule,
    ArticleModule,
    CategoryModule,
    SettingsModule,
    HomeModule,
    AboutModule,
    ContactModule,
    DashboardModule,
    NotificationModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
