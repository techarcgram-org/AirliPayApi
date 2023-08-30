import { Logger, Module } from '@nestjs/common';
import { SavingsBalanceService } from './savings-balance.service';
import { SavingsBalanceController } from './savings-balance.controller';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  controllers: [SavingsBalanceController],
  providers: [SavingsBalanceService, Logger, PrismaService],
})
export class SavingsBalanceModule {}
