import { Logger, Module } from '@nestjs/common';
import { AirlipayBalanceService } from './airlipay-balance.service';
import { AirlipayBalanceController } from './airlipay-balance.controller';
import { PaymentService } from 'src/core/payment/payment.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { PaymentModule } from 'src/core/payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [AirlipayBalanceController],
  providers: [AirlipayBalanceService, PrismaService, Logger],
})
export class AirlipayBalanceModule {}
