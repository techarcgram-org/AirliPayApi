import { Logger, Module } from '@nestjs/common';
import { AirlipayBalanceService } from './airlipay-balance.service';
import { AirlipayBalanceController } from './airlipay-balance.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { PaymentModule } from 'src/core/payment/payment.module';
import { PusherService } from 'src/core/pusher/pusher.service';
import { AppConfigModule } from 'src/config/config.module';
import { NotificationService } from 'src/core/notification/notification.service';
import { NotificationModule } from 'src/core/notification/notification.module';
@Module({
  imports: [PaymentModule, AppConfigModule, NotificationModule],
  controllers: [AirlipayBalanceController],
  providers: [AirlipayBalanceService, PrismaService, Logger, PusherService],
  exports: [AirlipayBalanceService],
})
export class AirlipayBalanceModule {}
