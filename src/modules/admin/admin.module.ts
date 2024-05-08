import { Logger, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, JwtService, Logger],
})
export class AdminModule {}
