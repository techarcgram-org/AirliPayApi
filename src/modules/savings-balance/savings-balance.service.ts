import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { logPrefix, toAirliPayMoney } from 'src/common/utils/util';
import { savings_balances } from '@prisma/client';
import * as moment from 'moment';

@Injectable()
export class SavingsBalanceService {
  constructor(private logger: Logger, private prismaService: PrismaService) {}
  async create(userId): Promise<savings_balances> {
    let savingsBalance: savings_balances;
    try {
      savingsBalance = await this.prismaService.savings_balances.create({
        data: {
          user_id: userId,
          balance: toAirliPayMoney(10000),
          created_at: moment().format(),
          updated_at: moment().format(),
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error creating new airlipay balance for user ${userId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return savingsBalance;
  }
}
