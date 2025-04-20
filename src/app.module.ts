import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import ormConfig from '../mikro-orm.config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(ormConfig),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
