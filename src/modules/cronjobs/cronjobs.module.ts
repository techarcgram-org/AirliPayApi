import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { AirlipayBalanceModule } from '../airlipay-balance/airlipay-balance.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  providers: [CronjobsService],
  imports: [AirlipayBalanceModule, InvoiceModule],
})
export class CronjobsModule {}
