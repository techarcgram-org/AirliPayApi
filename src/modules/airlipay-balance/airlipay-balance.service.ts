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
} from 'src/common/utils';
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
  operators,
  users,
} from '@prisma/client';
import { UpdateAirlipayBalanceDto } from './dto/update-airlipay-balance.dto';
import { ListTransactionDto } from './dto/list-transaction.dto';
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

      if (!balance) {
        balance = await this.create(user_id);
      }
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error getting airlipay balance for user ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
          balance: toAirliPayMoney(0),
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
    const currentDate = new Date();
    const is27thOr28th =
      currentDate.getDate() === 27 || currentDate.getDate() === 28;
    if (is27thOr28th) {
      throw new HttpException(
        `Withdrawal can not be done on the 27th or 28th of the month.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!phoneNumber) {
      const userObj = await this.prismaService.users.findFirst({
        where: {
          id: user.sub,
        },
        include: {
          addresses: true,
        },
      });
      phoneNumber = userObj.addresses.primary_phone_number;
    }

    // let pendingTransac: early_transactions;
    let earlyBalance: airlipay_balances;
    let transaction: early_transactions;
    let payment;
    const charges = (5 / 100) * amount;
    this.logger.log('CHARGES', charges);
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
          operator: telecomOperator(`237${phoneNumber}`),
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
        Number(transaction.id),
        null,
        null,
        null,
        String(user.sub),
      );

      if (payment) {
        await this.prismaService.airlipay_balances.update({
          where: {
            id: earlyBalance.id,
          },
          data: {
            balance: earlyBalance.balance - (amount + charges),
            updated_at: moment().format(),
          },
        });
      }
    } catch (error) {
      console.log(error);

      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // this.handlePaymentComplete(payment, earlyBalance, transaction, amount);
    transaction = await this.prismaService.early_transactions.findFirst({
      where: {
        id: transaction.id,
      },
    });
    return transaction;
  }

  async handlePaymentComplete(
    payment: any,
    earlyBalance: airlipay_balances,
    transaction: early_transactions,
    amount: number,
  ) {
    const response = await this.paymentService.onFapshiPaymentCompleted(
      payment.transId,
    );

    const airlipayUpdateObject: UpdateAirlipayBalanceDto = {
      id: earlyBalance.id,
      balance: earlyBalance.balance,
      early_transaction_id: transaction.id,
    };
    const userObject = await this.prismaService.users.findFirst({
      where: {
        id: earlyBalance.user_id,
      },
    });
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

        this.sendNotificationOnPaymentComplete(
          userObject,
          amount,
          PaymentStatus.SUCCESS,
        );
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
      this.logger.error('payment failed');
      this.sendNotificationOnPaymentComplete(
        userObject,
        amount,
        PaymentStatus.FAILED,
      );
    }
  }

  async handleWebhookComplete(response: any) {
    console.log('This is the webhook response =====>, ', response, '<======');

    const transaction = await this.prismaService.early_transactions.findFirst({
      where: {
        id: response.externalId,
      },
    });

    const user = await this.prismaService.users.findFirst({
      where: {
        id: response.userId,
      },
    });

    const earlyBalance = await this.prismaService.airlipay_balances.findFirst({
      where: {
        user_id: response.userId,
      },
    });

    const airlipayUpdateObject: UpdateAirlipayBalanceDto = {
      id: earlyBalance.id,
      balance: earlyBalance.balance + response.amount,
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

        this.sendNotificationOnPaymentComplete(
          user,
          toAirliPayMoney(response.amount),
          PaymentStatus.SUCCESS,
        );
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
      this.logger.error('payment failed');
      this.sendNotificationOnPaymentComplete(
        user,
        toAirliPayMoney(response.amount),
        PaymentStatus.FAILED,
      );
    }
  }

  async sendNotificationOnPaymentComplete(
    user: users,
    amount: number,
    status: PaymentStatus,
  ) {
    // preparing notification messages
    const userInfo = await this.prismaService.account_settings.findFirst({
      where: {
        user_id: user.id,
      },
      select: {
        device_id: true,
      },
    });

    this.logger.log(`${logPrefix()}: Notification User INFO: ${userInfo}`);

    if (userInfo?.device_id) {
      const notificationPush = {
        to: userInfo?.device_id,
        sound: 'default',
        title:
          status === PaymentStatus.SUCCESS
            ? 'Withdrawal Success'
            : 'Withdrawal Failed',
        body:
          status === PaymentStatus.SUCCESS
            ? `You have successful withdrawn ${toAirliPayMoney(
                amount,
              )} from your airlipay account. Enjoy💙`
            : `You have withdrawal of ${toAirliPayMoney(
                amount,
              )} from your airlipay account has failed, please try again later or contact support`,
      };
      this.notificationService.sendNotification([notificationPush]);
    }

    await this.prismaService.notifications.create({
      data: {
        title:
          status === PaymentStatus.SUCCESS
            ? 'Withdrawal Success'
            : 'Withdrawal Failed',
        message:
          status === PaymentStatus.SUCCESS
            ? `You have successful withdrawn ${toAirliPayMoney(
                amount,
              )} from your airlipay account. Enjoy💙`
            : `You have withdrawal of ${toAirliPayMoney(
                amount,
              )} from your airlipay account has failed, please try again later or contact support`,
        user_id: user.id,
        status: notification_status.PENDING,
        device_id: userInfo?.device_id,
        created_at: moment().format(),
        updated_at: moment().format(),
      },
    });
  }

  async listWithdrawalTransactions(
    user: any,
    listTransactionDto: ListTransactionDto,
  ): Promise<early_transactions[]> {
    const { status, type, page } = listTransactionDto;
    let { pageSize } = listTransactionDto;
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
    try {
      transactions = this.prismaService.early_transactions.findMany({
        where,
        skip: page ? (page - 1) * pageSize : undefined,
        take: pageSize,
        orderBy: { id: 'desc' },
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
        orderBy: { id: 'desc' },
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
  // @Cron('0 0 */1 * * 1-5', { name: 'balanceUpdateJob' })
  async updateBalance() {
    try {
      this.logger.debug(`${logPrefix()} => CRON to update balance has started`);
      const notifications: NotificationType[] = [];
      const users = await this.prismaService.users.findMany();
      this.logger.log(
        `${logPrefix()} - Users to update balance count: `,
        users,
      );
      for (const user of users) {
        const dailyPay = ((user.base_salary as any) / 21) * 0.5;
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
              balance: addAToB(balance.balance, dailyPay),
            },
          });

          await this.prismaService.early_transactions.create({
            data: {
              user_id: user.id,
              status: PaymentStatus.SUCCESS,
              initiated_date: moment().format(),
              execution_date: moment().format(),
              amount: toAirliPayMoney(dailyPay),
              fees: 0,
              transaction_type: PaymentType.DEPOSIT,
              new_balance: addAToB(balance.balance, dailyPay),
              old_balance: balance.balance,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          });

          this.logger.log(`Airlipay Added to ${user.name}`);

          // preparing notification messages
          const userInfo = await this.prismaService.account_settings.findFirst({
            where: {
              user_id: user.id,
            },
            select: {
              device_id: true,
            },
          });

          if (userInfo?.device_id) {
            notifications.push({
              to: userInfo?.device_id,
              sound: 'default',
              title: `Airlipay Balance`,
              body: `${toAirliPayMoney(dailyPay)} added to your Airlipay`,
            });
          }

          await this.prismaService.notifications.create({
            data: {
              title: `Airlipay Balance`,
              message: `${dailyPay} added to your Airlipay`,
              user_id: user.id,
              status: notification_status.PENDING,
              device_id: userInfo?.device_id,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          });
        }
      }
      await this.notificationService.sendNotification(notifications);
      this.logger.log(
        `${logPrefix()} => CRON to update balance has complete successfully`,
      );
    } catch (error) {
      this.logger.error(`${logPrefix} - error ${error}`);
      throw new HttpException(
        `Server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    // Sending actual notifications
  }
}
