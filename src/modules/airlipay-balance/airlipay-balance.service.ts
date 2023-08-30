import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserSession } from 'src/common/types/user.type';
import { PrismaService } from 'src/common/services/prisma.service';
import { PaymentService } from 'src/core/payment/payment.service';
import {
  addAToB,
  formatPhonenumber,
  logPrefix,
  subtractBFromA,
  telecomOperator,
  toAirliPayMoney,
} from 'src/common/utils/util';
import { PaymentStatus, PaymentType } from 'src/common/constants';
import * as moment from 'moment';
import {
  airlipay_balances,
  early_withdrawal_transactions,
} from '@prisma/client';
import { UpdateAirlipayBalanceDto } from './dto/update-airlipay-balance.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import currency from 'currency.js';

@Injectable()
export class AirlipayBalanceService {
  constructor(
    private prismaService: PrismaService,
    private paymentService: PaymentService,
    private logger: Logger,
  ) {}

  async create(userId: number): Promise<airlipay_balances> {
    let newBalance: airlipay_balances;
    try {
      newBalance = await this.prismaService.airlipay_balances.create({
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
    return newBalance;
  }

  async update(
    updateObject: UpdateAirlipayBalanceDto,
  ): Promise<airlipay_balances> {
    let updatedBalance: airlipay_balances;
    try {
      updatedBalance = await this.prismaService.airlipay_balances.update({
        where: {
          id: updateObject.id,
        },
        data: {
          ...updateObject,
          updated_at: moment().format(),
        },
      });
    } catch (error) {
      throw new HttpException(
        `Error updating ailipay balance }`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return updatedBalance;
  }

  async withdraw(user: UserSession, amount: number, phoneNumber: string) {
    let pendingTransac: early_withdrawal_transactions;
    let earlyBalance: airlipay_balances;
    let transaction: early_withdrawal_transactions;
    let payment;
    try {
      pendingTransac =
        await this.prismaService.early_withdrawal_transactions.findFirst({
          where: {
            user_id: user.sub,
            status: PaymentStatus.PENDING,
          },
        });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `error retriving pending transaction`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (pendingTransac) {
      throw new HttpException(
        `Already existing pending transaction`,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      earlyBalance =
        user.sub &&
        (await this.prismaService.airlipay_balances.findFirst({
          where: {
            user_id: user.sub,
          },
        }));
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new InternalServerErrorException('getting airlipay balance error');
    }
    if (!earlyBalance)
      throw new NotFoundException('early pay balance not found');
    if (toAirliPayMoney(amount) >= toAirliPayMoney(earlyBalance.balance + 10))
      throw new HttpException(`Insufficient balance`, HttpStatus.BAD_REQUEST);

    try {
      transaction =
        await this.prismaService.early_withdrawal_transactions.create({
          data: {
            user_id: user.sub,
            status: 'PENDING',
            transaction_type: 'WITHDRAW',
            initiated_date: moment().format(),
            execution_date: moment().format(),
            amount: toAirliPayMoney(amount),
            fees: 0,
            operator: telecomOperator(phoneNumber),
            phone_number: formatPhonenumber(phoneNumber),
            new_balance: subtractBFromA(earlyBalance.balance, amount),
            old_balance: earlyBalance.balance,
            created_at: moment().format(),
            updated_at: moment().format(),
          },
        });
      payment = await this.paymentService.initTransaction(
        PaymentType.DEPOSIT,
        phoneNumber,
        amount,
        transaction.id.toString(),
        'Balance Withdrawal',
        transaction.id.toString(),
      );
      await this.prismaService.airlipay_balances.update({
        where: {
          id: earlyBalance.id,
        },
        data: {
          balance: subtractBFromA(earlyBalance.balance, amount),
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.paymentService.onPaymentCompleted(payment).then(async (response) => {
      const airlipayUpdateObject: UpdateAirlipayBalanceDto = {
        id: earlyBalance.id,
        balance: earlyBalance.balance,
        early_withdrawal_transaction_id: transaction.id,
      };
      if (response.status === PaymentStatus.SUCCESS) {
        try {
          await this.prismaService.early_withdrawal_transactions.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: 'SUCCESS',
              updated_at: moment().format(),
            },
          });
        } catch (error) {
          this.logger.error(`${logPrefix()} ${error}`);
          throw new HttpException(
            `Error updating early withdrawal transaction}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else if (response.status === PaymentStatus.FAILED) {
        await this.prismaService.early_withdrawal_transactions.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: 'FAILED',
            updated_at: moment().format(),
          },
        });
        this.update(airlipayUpdateObject);
        console.log('payment failed');
      }
    });

    transaction =
      await this.prismaService.early_withdrawal_transactions.findFirst({
        where: {
          id: transaction.id,
        },
      });

    return transaction;
  }

  // @Cron(CronExpression.EVERY_HOUR)
  @Cron('0 */1 * * * 1-5')
  async updateBalance() {
    try {
      const users = await this.prismaService.users.findMany();
      users.forEach(async (user) => {
        const biMinutePay = (user.base_salary as any) / 2 / 20 / 24 / 60;
        const balance = await this.prismaService.airlipay_balances.findFirst({
          where: {
            user_id: user.id,
          },
        });
        if (balance) {
          await this.prismaService.airlipay_balances.update({
            where: {
              id: balance.id,
            },
            data: {
              balance: addAToB(balance.balance, biMinutePay),
            },
          });
        }
      });
    } catch (error) {
      this.logger.error(`error ${error}`);
      throw new HttpException(
        `Server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
