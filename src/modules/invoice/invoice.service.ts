import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { logPrefix } from 'src/common/utils/util';
import * as moment from 'moment';
import { Cron } from '@nestjs/schedule';
import { InvoiceStatus, TransactionType } from 'src/common/constants';
import { ListInvoicesDto } from './dto/list-invoices.dto';
import { transaction_types } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private prismaService: PrismaService, private logger: Logger) {}

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
      transactions = await this.prismaService.users.findMany({
        where: {
          client_id: invoice.client_id,
        },
        include: {
          early_transactions: {
            where: {
              transaction_type: transaction_types.DEPOSIT,
              initiated_date: {
                gte: invoice.from, // Greater than or equal to the start date
                lt: invoice.to, // Less than or equal to the end date
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error getting transactions of users of invoice ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return transactions;
  }

  // @Cron(CronExpression.EVERY_HOUR)
  @Cron('0 0 0 * * 1-5', { name: 'invoiceGenerateJob' })
  async generateInvoice() {
    const endDate = moment().format();
    const startDate = moment().subtract(2, 'd').format();

    let clients;
    try {
      clients = await this.prismaService.clients.findMany({
        where: {
          next_payment_date: {
            gt: moment().startOf('day').format(),
            lte: moment().endOf('day').format(),
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
      let transactObj;
      users.forEach((user) => {
        const transactions = user.early_transactions;

        transactions.forEach((transaction) => {
          totalAmount += transaction.amount;
          totalFee += transaction.fees;
        });
        transactObj.append({
          userId: user.id,
          name: user.name,
          baseSalary: user.base_salary,
          transactions: transactions,
        });
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

        client.update({
          data: {
            next_payment_date: moment(client.next_payment_date).add(30, 'days'),
          },
        });
        this.logger.debug(
          `Invoice for client ${client.name} with ID: ${client.id} generated successfully`,
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
