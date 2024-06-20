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
import {
  airlipay_balances,
  early_transactions,
  notification_status,
} from '@prisma/client';
import { UpdateAirlipayBalanceDto } from './dto/update-airlipay-balance.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import currency from 'currency.js';
import { ListTransactionDto } from './dto/list-transaction.dto';
import { IsPhoneNumber } from 'class-validator';
import { PusherService } from 'src/core/pusher/pusher.service';
import { NotificationService } from 'src/core/notification/notification.service';
import { NotificationType } from 'src/common/types/types..type';
@Injectable()
export class AirlipayBalanceService {
  constructor(
    private prismaService: PrismaService,
    private paymentService: PaymentService,
    private logger: Logger,
    private notificationService: NotificationService,
  ) {}

  async getUserBalance(user_id: number): Promise<airlipay_balances> {
    let balance: airlipay_balances;
    try {
      balance = await this.prismaService.airlipay_balances.findFirst({
        where: {
          user_id: user_id,
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
      const userObj = await this.prismaService.users.findFirst({
        where: {
          id: user.sub,
        },
        include: {
          addresses: true,
        },
      });
      console.log(user);
      phoneNumber = userObj.addresses.primary_phone_number;
    }
    // let pendingTransac: early_transactions;
    let earlyBalance: airlipay_balances;
    let transaction: early_transactions;
    let payment;
    const charges = (5 / 100) * amount;
    console.log('CHARGES', charges);
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
          fees: charges,
          operator: telecomOperator(phoneNumber),
          phone_number: phoneNumber,
          new_balance: subtractBFromA(earlyBalance.balance, amount + charges),
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
      payment = await this.paymentService.initiateFapshiPayout(
        phoneNumber,
        amount,
      );
      // await this.prismaService.airlipay_balances.update({
      //   where: {
      //     id: earlyBalance.id,
      //   },
      //   data: {
      //     balance: subtractBFromA(earlyBalance.balance, amount),
      //   },
      // });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const response = await this.paymentService.onFapshiPaymentCompleted(
      payment.transId,
    );

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

        await this.prismaService.airlipay_balances.update({
          where: {
            id: earlyBalance.id,
          },
          data: {
            balance: earlyBalance.balance - (amount + charges),
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

    transaction = await this.prismaService.early_transactions.findFirst({
      where: {
        id: transaction.id,
      },
    });

    return transaction;
  }

  async listWithdrawalTransactions(
    user: any,
    listTransactionDto: ListTransactionDto,
  ): Promise<early_transactions[]> {
    let { status, type, page, pageSize } = listTransactionDto;
    let transactions;
    let where = {};
    pageSize = pageSize ? pageSize : 15;
    if (user?.roles?.includes('USER')) {
      where = { ...where, user_id: user.sub };
    }
    if (listTransactionDto.status) {
      where = { ...where, status };
    }
    if (listTransactionDto.type) {
      where = { ...where, transaction_type: type };
    }
    console.log('WHERE', where, listTransactionDto);
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

  async listUserWithdrawalTransactions(
    user_id: number,
    listTransactionDto: ListTransactionDto,
  ): Promise<early_transactions[]> {
    const { status, type, page } = listTransactionDto;
    let transactions;
    let where = {};
    const pageSize = listTransactionDto.pageSize
      ? listTransactionDto.pageSize
      : 15;
    where = { ...where, user_id: user_id };
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
  @Cron('0 */5 * * * 1-5', { name: 'balanceUpdateJob' })
  async updateBalance() {
    try {
      const notifications: NotificationType[] = [];
      const users = await this.prismaService.users.findMany();
      console.log('USERS', users);
      for (const user of users) {
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

          this.logger.log(`Airlipay Added to ${user.name}`);

          // preparing notification messages
          const { device_id } =
            await this.prismaService.account_settings.findFirst({
              where: {
                user_id: user.id,
              },
              select: {
                device_id: true,
              },
            });

          if (device_id) {
            notifications.push({
              to: device_id,
              sound: 'default',
              title: `Airlipay Balance`,
              body: `${biHourlyPay} added to your Airlipay`,
            });
          }

          await this.prismaService.notifications.create({
            data: {
              title: `Airlipay Balance`,
              message: `${biHourlyPay} added to your Airlipay`,
              user_id: user.id,
              status: notification_status.PENDING,
              device_id: device_id,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          });
        }
      }
      await this.notificationService.sendNotification(notifications);
    } catch (error) {
      this.logger.error(`error ${error}`);
      throw new HttpException(
        `Server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    // Sending actual notifications
  }
}
