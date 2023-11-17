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
import {
  PaymentStatus,
  PaymentType,
  PusherChannels,
  PusherEvents,
  TransactionType,
} from 'src/common/constants';
import * as moment from 'moment';
import { airlipay_balances, early_transactions } from '@prisma/client';
import { UpdateAirlipayBalanceDto } from './dto/update-airlipay-balance.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import currency from 'currency.js';
import { ListTransactionDto } from './dto/list-transaction.dto';
import { IsPhoneNumber } from 'class-validator';
import { PusherService } from 'src/core/pusher/pusher.service';

@Injectable()
export class AirlipayBalanceService {
  constructor(
    private prismaService: PrismaService,
    private paymentService: PaymentService,
    private logger: Logger,
    private pusherService: PusherService,
  ) {}

  async getUserBalance(user: UserSession): Promise<airlipay_balances> {
    let balance: airlipay_balances;
    try {
      balance = await this.prismaService.airlipay_balances.findFirst({
        where: {
          user_id: user.sub,
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error gettting airlipay balance for user ${error}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return balance;
  }

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
        `Error updating ailipay balance ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return updatedBalance;
  }

  async withdraw(user: UserSession, amount: number, phoneNumber: string) {
    if (!phoneNumber) {
      const momo =
        await this.prismaService.user_mobile_money_accounts.findFirst({
          where: {
            user_id: user.sub,
            default: true,
          },
        });
      phoneNumber = momo.phone_number;
    }
    // let pendingTransac: early_transactions;
    let earlyBalance: airlipay_balances;
    let transaction: early_transactions;
    let payment;
    // try {
    //   pendingTransac = await this.prismaService.early_transactions.findFirst({
    //     where: {
    //       user_id: user.sub,
    //       status: PaymentStatus.PENDING,
    //     },
    //   });
    // } catch (error) {
    //   this.logger.error(`${logPrefix()} ${error}`);
    //   throw new HttpException(
    //     `error retriving pending transaction`,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
    // if (pendingTransac) {
    //   throw new HttpException(
    //     `Already existing pending transaction`,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
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
      transaction = await this.prismaService.early_transactions.create({
        data: {
          user_id: user.sub,
          status: PaymentStatus.PENDING,
          transaction_type: PaymentType.WITHDRAW,
          initiated_date: moment().format(),
          execution_date: moment().format(),
          amount: toAirliPayMoney(amount),
          fees: 0,
          operator: telecomOperator(phoneNumber),
          phone_number: phoneNumber,
          new_balance: subtractBFromA(earlyBalance.balance, amount),
          old_balance: earlyBalance.balance,
          created_at: moment().format(),
          updated_at: moment().format(),
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
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
        early_transaction_id: transaction.id,
      };
      if (response.status === PaymentStatus.SUCCESS) {
        try {
          await this.prismaService.early_transactions.update({
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
            `Error updating early withdrawal transaction ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else if (response.status === PaymentStatus.FAILED) {
        await this.prismaService.early_transactions.update({
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

    transaction = await this.prismaService.early_transactions.findFirst({
      where: {
        id: transaction.id,
      },
    });

    return transaction;
  }

  async listWithdrawalTransac(
    user: UserSession,
    listTransactionDto: ListTransactionDto,
  ): Promise<early_transactions[]> {
    const { status, type, page } = listTransactionDto;
    let transactions;
    let where = {};
    const pageSize = listTransactionDto.pageSize
      ? listTransactionDto.pageSize
      : 15;
    if (user) {
      where = { ...where, user_id: user.sub };
    }
    if (listTransactionDto.status) {
      where = { ...where, status };
    }
    if (listTransactionDto.type) {
      where = { ...where, transaction_type: type };
    }
    try {
      transactions = this.prismaService.early_transactions.findMany({
        where,
        skip: page ? (page - 1) * pageSize : undefined,
        take: pageSize,
      });
    } catch (error) {
      this.logger.error(`error ${error}`);
      throw new HttpException(
        `Server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return transactions;
  }

  // @Cron(CronExpression.EVERY_HOUR)
  @Cron('0 0 */1 * * 1-5')
  async updateBalance() {
    try {
      const users = await this.prismaService.users.findMany();
      users.forEach(async (user) => {
        const biHourlyPay = (user.base_salary as any) / 2 / 20 / 24;
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
              balance: addAToB(balance.balance, biHourlyPay),
            },
          });
          await this.prismaService.early_transactions.create({
            data: {
              user_id: user.id,
              status: PaymentStatus.SUCCESS,
              initiated_date: moment().format(),
              execution_date: moment().format(),
              amount: toAirliPayMoney(biHourlyPay),
              fees: 0,
              transaction_type: PaymentType.DEPOSIT,
              new_balance: addAToB(balance.balance, biHourlyPay),
              old_balance: balance.balance,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          });
          try {
            const channel = PusherChannels.PAYMENT_SUCCESS + `-${user.id}`;
            const data = {
              amount: biHourlyPay,
              user: user.id,
              type: PusherEvents.EARLYPAY_TOPUP_SUCCESS,
            };
            await this.pusherService.trigger(
              'my-channel',
              PusherEvents.EARLYPAY_TOPUP_SUCCESS,
              data,
            );
          } catch (error) {
            this.logger.debug(
              `Failed to trigger pusher event: ${error?.message}`,
            );
          }
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
