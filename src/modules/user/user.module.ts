import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersController } from './user.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/core/mail/mail.service';
import { AirlipayBalanceService } from '../airlipay-balance/airlipay-balance.service';
import { PaymentModule } from 'src/core/payment/payment.module';
import { PusherService } from 'src/core/pusher/pusher.service';
import { PusherModule } from 'src/core/pusher/pusher.module';
import { AirlipayBalanceModule } from '../airlipay-balance/airlipay-balance.module';

@Module({
  imports: [AirlipayBalanceModule],
  controllers: [UsersController],
  providers: [UserService, PrismaService, JwtService, MailService, Logger],
  exports: [UserService],
})
export class UserModule {}
