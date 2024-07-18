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

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'balanceUpdateJob' })
  async updateAirlipayBalances() {
    this.airlipayBalanceService.updateBalance();
  }

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'invoiceGenerateJob' })
  async generateInvoice() {
    this.invoiceService.generateInvoice();
  }
}
