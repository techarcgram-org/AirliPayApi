import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AirlipayBalanceService } from '../airlipay-balance/airlipay-balance.service';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class CronjobsService {
  constructor(
    private airlipayBalanceService: AirlipayBalanceService,
    private invoiceService: InvoiceService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'balanceUpdateJob' })
  async updateAirlipayBalances() {
    this.airlipayBalanceService.updateBalance();
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'invoiceGenerateJob' })
  @Cron('0 0 0 27 * *', { name: 'invoiceGenerateJob' })
  async generateInvoice() {
    this.invoiceService.generateInvoice();
  }
}
