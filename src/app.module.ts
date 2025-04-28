import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './user/users.module';
import { AppService } from './app.service';
import { FileModule } from './media/media.module';
import { MailModule } from './mail/mail.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ArticlesModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { SettingsModule } from './settings/settings.module';
import { HomeModule } from './pages/home/home.module';
import { AboutModule } from './pages/about/about.module';
import { ContactModule } from './pages/contact/contact.module';
import { User } from './user/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Permission } from './permissions/entities/permission.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { CoreModule } from './shared/core.module';
import { NotificationModule } from './notification/notification.module';
import { LogsModule } from './shared/logs/logs.module';
import { AppConfigService } from './shared/config/config.service';
import { APP_GUARD } from '@nestjs/core';
import { NewsModule } from './news/news.module';
import { JwtAuthGuard } from './auth/guard/jwt.guard';
import { RolesGuard } from './auth/guard/roles.guard';
import { PermissionsGuard } from './auth/guard/permissions.guard';
import { UserRoleSeeder } from './seeder/user-role.seeder';

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
    CoreModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    FileModule,
    MailModule,
    ArticlesModule,
    CategoryModule,
    SettingsModule,
    HomeModule,
    AboutModule,
    ContactModule,
    DashboardModule,
    NotificationModule,
    LogsModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserRoleSeeder,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})

export class AppModule implements OnModuleInit {
  constructor(private readonly userRoleSeeder: UserRoleSeeder) { }

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.userRoleSeeder.onModuleInit(); // Chạy seeder khi ứng dụng không phải production
    } else {
      console.log('Skipping seeding in production environment.');
    }
  }
}
