import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  PaymentStatus,
  PaymentType,
  TelecomOperator,
} from '../../common/constants';
import { MtnService } from './mtn/mtn.service';
import { telecomOperator } from '../../common/utils/util';
import { Payment } from './Payment';
import { logPrefix, delay } from '../../common/utils/util';
import { FapshiService } from './fapshi/fapshi.service';

@Injectable()
export class PaymentService {
  constructor(
    private logger: Logger,
    private mtnService: MtnService, // @InjectRepository(MobileMoneyAccessControl) // private accessControlRepo: Repository<MobileMoneyAccessControl>, // private mailService: MailService, // private appConfigService: AppConfigService, // private adminService: AdminService,
    private fapshiService: FapshiService,
  ) {}

  async fetchTransaction(
    type: PaymentType,
    operator: TelecomOperator,
    referenceId: string,
  ): Promise<Payment> {
    switch (operator) {
      case TelecomOperator.MTN:
        const mtnPayment = await this.mtnService.paymentStatus(
          type,
          referenceId,
        );
        return <Payment>{
          type: type,
          operator: TelecomOperator.MTN,
          mtn: mtnPayment,
        };
      case TelecomOperator.UNKNOWN:
        throw new Error('unknown telecom operator');
    }
  }

  async initTransaction(
    type: PaymentType,
    phoneNumber: string,
    amount: number,
    externalId: string,
    note: string,
    message: string,
  ): Promise<Payment> {
    const operator = telecomOperator(phoneNumber);
    switch (operator) {
      case TelecomOperator.MTN:
        try {
          const mtnPayment = await this.mtnService.initTransaction(
            type,
            phoneNumber,
            amount,
            `airliPay_payments_${externalId}`,
            note,
            message,
          );
          return <Payment>{
            type: type,
            operator: TelecomOperator.MTN,
            mtn: mtnPayment,
          };
        } catch (error) {
          throw new HttpException(error?.message, error?.status);
        }

      default:
        throw new Error('unknown telecom operator');
    }
  }

  async initiateFapshiPayout(
    phone: string,
    amount: number,
    medium?: string,
    name?: string,
    email?: string,
    userId?: string,
  ) {
    const fapshiPayment = await this.fapshiService.initiatePayout(
      phone,
      amount,
      medium,
      name,
      email,
      userId,
    );
    return fapshiPayment;
  }

  // async getAccessControl(): Promise<MobileMoneyAccessControl> {
  //   return this.accessControlRepo.findOneBy({});
  // }

  async onFapshiPaymentCompleted(transactionId: string) {
    let i = 0;
    let status: PaymentStatus;
    let maxChecks = 20;
    let response;
    let exceptionCount = 0;
    let lastException: any;
    for (; i < maxChecks; i++) {
      try {
        response = await this.fapshiService.paymentStatus(transactionId);
        console.log('RESPONSE', response);
      } catch (e) {
        this.logger.error(`${logPrefix()} Error fetching transaction: ${e}`);
        if (lastException === e) {
          exceptionCount++;
        } else {
          lastException = e;
          exceptionCount = 1;
        }
        if (exceptionCount >= 5) {
          // 5 consecutive exceptions have occurred. Break out of the loop.
          break;
        }
      }

      status = response.status;

      if (
        status &&
        status !== PaymentStatus.PENDING &&
        status &&
        status !== PaymentStatus.CREATED
      ) {
        break;
      }

      if (i < 10) {
        // For the first checks, wait for 60 seconds
        await delay(60000);
      } else if (i >= 10) {
        // After 10 checks, wait for 1 hour
        await delay(120000);
      } else {
        // For all other checks, wait for 2 minutes
        await delay(120000);
      }

      // If there is only one retry left and we have not exceeded the maximum number of checks, increase the maximum number of checks by 24
      const remainingRetries = maxChecks - i - 1;
      if (remainingRetries === 1 && i < 33) {
        maxChecks += 24;
      }
    }

    // timeout reached. Assume tx has failed.
    if (i >= maxChecks && status === PaymentStatus.PENDING) {
      status = PaymentStatus.FAILED;
    }
    if (status === PaymentStatus.FAILED) {
      status = PaymentStatus.FAILED;
    }
    if (status === PaymentStatus.EXPIRED) {
      status = PaymentStatus.FAILED;
    }
    response.status = status;
    if (
      response.status.toString() == 'SUCCESSFUL' ||
      response.status.toString() == 'SUCCESSFULL'
    ) {
      response.status = PaymentStatus.SUCCESS;
    }
    return response;
  }

  async onPaymentCompleted(payment: Payment) {
    let i = 0;
    let status: PaymentStatus;
    let maxChecks = 10;
    let response: Payment;
    let exceptionCount = 0;
    let lastException: any;
    for (; i < maxChecks; i++) {
      try {
        response = await this.fetchTransaction(
          payment.type,
          payment.operator,
          payment.operator == TelecomOperator.MTN
            ? payment.mtn.financialTransactionId
            : payment.orange.payToken,
        );
      } catch (e) {
        this.logger.error(`${logPrefix()} Error fetching transaction: ${e}`);
        if (lastException === e) {
          exceptionCount++;
        } else {
          lastException = e;
          exceptionCount = 1;
        }
        if (exceptionCount >= 5) {
          // 5 consecutive exceptions have occurred. Break out of the loop.
          break;
        }
      }

      status = (
        payment.operator === TelecomOperator.MTN
          ? response?.mtn?.status
          : response?.orange?.status
      ) as PaymentStatus;

      if (status && status !== PaymentStatus.PENDING) {
        break;
      }

      if (i < 1) {
        // For the first checks, wait for 60 seconds
        await delay(60000);
      } else if (i >= 10) {
        // After 10 checks, wait for 1 hour
        await delay(3600000);
      } else {
        // For all other checks, wait for 2 minutes
        await delay(120000);
      }

      // If there is only one retry left and we have not exceeded the maximum number of checks, increase the maximum number of checks by 24
      const remainingRetries = maxChecks - i - 1;
      if (remainingRetries === 1 && i < 33) {
        maxChecks += 24;
      }
    }

    // timeout reached. Assume tx has failed.
    if (i >= maxChecks && status === PaymentStatus.PENDING) {
      status = PaymentStatus.FAILED;
    }
    response.status = status;
    if (
      response.status.toString() == 'SUCCESSFUL' ||
      response.status.toString() == 'SUCCESSFULL'
    ) {
      response.status = PaymentStatus.SUCCESS;
    }
    return response;
  }

  async mtnHealth(type: PaymentType) {
    return this.mtnService.mtnHealthCheck(type);
  }

  // async orangeHealth(type: PaymentType) {
  //   return this.orangeService.orangeHealthCheck(type);
  // }

  //   @Cron(CronExpression.EVERY_10_MINUTES)
  //   async checkMtnAccountBalance() {
  //     if (this.appConfigService.app.env != 'prod') {
  //       return;
  //     }
  //     let emailCounter = 0;
  //     let admins: User[];
  //     try {
  //       admins = await this.adminService.getAdmins();
  //     } catch (e) {
  //       // Sentry.captureException(e);
  //       this.logger.error(`${logPrefix()} Error getting admins from dp: ${e}`);
  //       throw new HttpException(
  //         ` Error getting admins from dp: ${e}`,
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //     const balance = await this.mtnService.getAccountBalance();
  //     if (
  //       balance &&
  //       toAirliPayMoney(parseFloat(balance.availableBalance)) <
  //         toAirliPayMoney(500000)
  //     ) {
  //       try {
  //         if (emailCounter < 10) {
  //           for (let i = 0; i < admins.length; i++) {
  //             try {
  //               await this.mailService.sendMail({
  //                 to: admins[i].custEmail,
  //                 from: this.appConfigService.mailer.from,
  //                 subject: `AirliPay Alert`,
  //                 text: ``,
  //                 template: 'otp',
  //                 context: {
  //                   title: 'AirliPay Alert',
  //                   helloText: `Hello`,
  //                   customerName: `${admins[i].custName}`,
  //                   description: `MTN Account balance is lowwer than 500,000FCFA. Current account balance ${parseFloat(
  //                     balance.availableBalance,
  //                   )}FCFA`,
  //                 },
  //               });
  //               emailCounter++;
  //             } catch (e) {
  //               this.logger.error(
  //                 `${logPrefix()} Error sending low balance alert for MTN: ${e}`,
  //               );
  //             }
  //           }
  //         } else {
  //           emailCounter = 0; // Reset here
  //         }
  //       } catch (e) {
  //         this.logger.error(
  //           `${logPrefix()} Error sending low balance alert for MTN: ${e}`,
  //         );
  //       }
  //     }
  //   }
}
