import { Controller } from '@nestjs/common';
import { SavingsBalanceService } from './savings-balance.service';

@Controller('savings-balance')
export class SavingsBalanceController {
  constructor(private readonly savingsBalanceService: SavingsBalanceService) {}
}
