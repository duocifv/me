import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import ormConfig from '../mikro-orm.config';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(ormConfig),
    UsersModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: RolesGuard }, AppService],
})
export class AppModule {}
