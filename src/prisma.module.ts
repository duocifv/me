import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // giúp module này dùng được toàn app, không cần import lại
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
