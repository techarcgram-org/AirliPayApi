import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { logPrefix } from 'src/common/utils/util';
import * as moment from 'moment';
import { Cron } from '@nestjs/schedule';
import { InvoiceStatus } from 'src/common/constants';
import { ListInvoicesDto } from './dto/list-invoices.dto';

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

  // @Cron(CronExpression.EVERY_HOUR)
  @Cron('0 0 */1 * * 1-5', { name: 'invoiceGenerateJob' })
  async generateInvoice() {
    const endDate = moment().format();
    const startDate = moment().subtract(2, 'd').format();
    let clients;
    try {
      clients = await this.prismaService.clients.findMany({
        include: {
          users: {
            include: {
              early_transactions: {
                where: {
                  initiated_date: {
                    gte: startDate, // Greater than or equal to the start date
                    lt: endDate, // Less than or equal to the end date
                  },
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
      users.forEach((user) => {
        const transactions = user.early_transactions;
        transactions.forEach((transaction) => {
          totalAmount += transaction.amount;
          totalFee += transaction.fees;
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
            created_at: moment().format(),
            updated_at: moment().format(),
          },
        });
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
