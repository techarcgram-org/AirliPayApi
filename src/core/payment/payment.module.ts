import { Logger, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MtnService } from './mtn/mtn.service';
import { AppConfigModule } from '../../config/config.module';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [AppConfigModule, MailModule],
  providers: [PaymentService, Logger, MtnService],
  exports: [PaymentService],
})
export class PaymentModule {}
