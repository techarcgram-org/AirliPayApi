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

  @Cron('0 0 */1 * * 1-5', { name: 'balanceUpdateJob' })
  async updateAirlipayBalances() {
    this.airlipayBalanceService.updateBalance();
  }

  @Cron('0 0 0 * * *', { name: 'invoiceGenerateJob' })
  async generateInvoice() {
    this.invoiceService.generateInvoice();
  }
}
