import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProfileController } from './profile/profile.controller';
import { dataSource } from './data.source';
import { UserModule } from './user/user.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSource.options), AuthModule, UserModule],
  controllers: [ProfileController],
})
export class AppModule {}
