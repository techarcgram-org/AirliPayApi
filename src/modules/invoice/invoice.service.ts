import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { logPrefix, toAirliPayMoney } from 'src/common/utils';
import * as moment from 'moment';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceStatus, TransactionType } from 'src/common/constants';
import { ListInvoicesDto } from './dto/list-invoices.dto';
import { transaction_types, invoice_status } from '@prisma/client';
import { Client } from '../client/entities/client.entity';
import { MailService } from 'src/core/mail/mail.service';

@Injectable()
export class InvoiceService {
  constructor(
    private prismaService: PrismaService,
    private logger: Logger,
    private mailService: MailService,
  ) {}

  async findAll(listInvoicesDto: ListInvoicesDto) {
    const { page } = listInvoicesDto;
    let invoices;
    const pageSize = listInvoicesDto.pageSize ? listInvoicesDto.pageSize : 15;
    const where = {};
    try {
      invoices = await this.prismaService.invoices.findMany({
        where,
        skip: page ? (page - 1) * pageSize : undefined,
        take: pageSize,
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error getting client invoices`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return invoices;
  }

  async invoiceTransactions(id: number) {
    let transactions;
    let invoice;
    try {
      invoice = await this.prismaService.invoices.findFirst({
        where: {
          id,
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error getting invoice with id ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
      transactions = await this.prismaService.early_transactions.findMany({
        where: {
          users: {
            client_id: invoice.client_id,
          },
          initiated_date: {
            gte: invoice.from, // Greater than or equal to the start date
            lt: invoice.to, // Less than or equal to the end date
          },
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error getting transactions of invoice ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return transactions;
  }

  // this is going to update the invoice status
  async updateInvoiceStatus(
    invoice_id: number,
    updateInvoiceDto: UpdateInvoiceDto,
  ) {
    try {
      const updatedInvoice = await this.prismaService.invoices.update({
        where: {
          id: invoice_id,
        },
        data: {
          status: updateInvoiceDto.status,
        },
      });

      return updatedInvoice;
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error updating invoice status  ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Cron('0 0 0 * * *', { name: 'invoiceGenerateJob' })
  // @Cron(CronExpression.EVERY_5_MINUTES)
  async generateInvoice() {
    this.logger.debug(`${logPrefix()} => CRON to generate invoice has started`);

    const startDate = moment()
      .subtract(1, 'month')
      .date(29)
      .startOf('day')
      .format();
    const endDate = moment().subtract(1, 'day').date(26).endOf('day').format();
    const queryEndDate = moment().date(29).endOf('day').format();
    // const dateLimit = moment().subtract(1, 'month').date(28).format('YYYY-MM-DD') + 'T00:00:00.000Z';
    let clients;
    try {
      this.logger.log(
        `Fetching all clients with payment date scheduled between: ${startDate} and end date ${endDate}`,
      );
      clients = await this.prismaService.clients.findMany({
        where: {
          next_payment_date: {
            gt: startDate,
            lte: queryEndDate,
          },
        },
        include: {
          users: {
            include: {
              early_transactions: {
                where: {
                  initiated_date: {
                    gte: startDate, // Greater than or equal to the start date
                    lt: endDate, // Less than or equal to the end date
                  },
                  transaction_type: transaction_types.WITHDRAW,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error getting list of clients  ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.log(
      `${logPrefix()} - The total clients to generate invoice for: ${
        clients.length
      }`,
    );
    clients.forEach(async (client) => {
      const users = client.users;
      let totalAmount = 0;
      let totalFee = 0;
      const datePrefix = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      let lastInvoice;

      try {
        lastInvoice = await this.prismaService.invoices.findFirst({
          orderBy: { id: 'desc' },
        });
      } catch (error) {
        this.logger.error(`${logPrefix()} ${error}`);
        throw new HttpException(
          `Error getting last invoice  ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const nextInvoiceNumber = lastInvoice ? Number(lastInvoice.id) + 1 : 1;
      const invoiceNumber = `${datePrefix}-${nextInvoiceNumber
        .toString()
        .padStart(4, '0')}`; // YYYY-MM-DD-0001
      let transactObj: Array<{
        userId: any;
        name: any;
        baseSalary: any;
        transactions: any;
      }> = [];
      users.forEach(async (user) => {
        const transactions = user.early_transactions;

        transactions.forEach((transaction) => {
          totalAmount += transaction.amount;
          totalFee += transaction.fees;
        });
        transactObj.push({
          userId: user.id,
          name: user.name,
          baseSalary: user.base_salary,
          transactions: transactions,
        });
        const user_balance =
          await this.prismaService.airlipay_balances.findFirst({
            where: {
              user_id: user.id,
            },
          });

        if (user_balance) {
          await this.prismaService.airlipay_balances.update({
            where: {
              id: user_balance.id,
            },
            data: {
              balance: toAirliPayMoney(0),
            },
          });
        }
      });
      try {
        await this.prismaService.invoices.create({
          data: {
            invoice_number: invoiceNumber,
            client_id: client.id,
            status: InvoiceStatus.NOT_TREATED,
            totalAmount: totalAmount,
            totalFees: totalFee,
            from: startDate,
            to: endDate,
            taxes: 0,
            transactions: transactObj,
            created_at: moment().format(),
            updated_at: moment().format(),
          },
        });

        this.logger.debug(
          `Invoice for client ${client.name} with ID: ${client.id} generated successfully`,
        );

        const next_payment_date = moment(client.next_payment_date)
          .add(1, 'months')
          .date(28)
          .format();

        this.logger.log(`Scheduled next payment date: ${next_payment_date}`);

        await this.prismaService.clients.update({
          where: {
            id: client.id,
          },
          data: {
            next_payment_date: next_payment_date,
          },
        });
        this.logger.debug(
          `The next payment date for client ${client.name} with ID: ${client.id} has been updated to: ${next_payment_date}`,
        );
      } catch (error) {
        this.logger.error(`${logPrefix()} ${error}`);
        throw new HttpException(
          `Error creating invoice  ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }
}
