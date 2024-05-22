import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { create } from 'domain';
import { AccountStatus, InvoiceStatus, Role } from 'src/common/constants';
import {
  constructUsersArrayFromCsv,
  generatePasswordHash,
  logPrefix,
} from 'src/common/utils/util';
import * as moment from 'moment';
import { MailService } from 'src/core/mail/mail.service';
import { Prisma } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { CreateClientBankDto } from './dto/create-client-bank.dto';

@Injectable()
export class ClientService {
  constructor(
    private prismaService: PrismaService,
    private logger: Logger,
    private mailService: MailService,
  ) {}

  async create(createClientDto: CreateClientDto, file: Express.Multer.File) {
    let client;
    const nextPaydate = moment(createClientDto.nextPaymentDate).isValid()
      ? moment(createClientDto.nextPaymentDate).format()
      : null;
    try {
      client = await this.prismaService.clients.create({
        data: {
          name: createClientDto.name,
          industry: createClientDto.industry,
          tax_id: createClientDto.taxId,
          client_commision: createClientDto.clientCommision,
          // earning_report_status: createClientDto.earning_report_status,
          next_payment_date: moment(
            createClientDto.nextPaymentDate,
            'YYYY-MM-DD',
          ).format(),
          employee_roaster_file: file?.filename || null,
          accounts: {
            create: {
              email: createClientDto.email,
              encrypted_password: generatePasswordHash('Testing'),
              account_type: Role.CLIENT,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          },
          addresses: {
            create: {
              primary_phone_number: createClientDto.primaryPhone,
              city: createClientDto.city,
              region: createClientDto.region,
              street: createClientDto.street,
              secondery_phone_number: createClientDto.secondaryPhone,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          },
          created_at: moment().format(),
          updated_at: moment().format(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.error(`${logPrefix()} ${error.message}`);
        // Handle the error, e.g., send a response to the client
        throw new HttpException(
          'Username or email already exists.',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        this.logger.error(`${logPrefix()} ${error}`);
        throw new HttpException(
          `Error creating user: ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    // Creates account for every user from employee roaster csv
    if (file) {
      const users = await constructUsersArrayFromCsv(file);
      users.forEach(async (user) => {
        const random = (Math.random() + 1).toString(36).substring(4);
        const employee_id =
          createClientDto.name.toLocaleLowerCase().slice(0, 2) +
          user.name.toLocaleLowerCase().slice(0, 2) +
          random;
        await this.prismaService.users.create({
          data: {
            name: user.name,
            base_salary: user.base_salary,
            sex: user.sex,
            photo: user.photo,
            dob: moment(user.dob, 'DD/MM/YYY').format(),
            employee_id: employee_id,
            clients: {
              connect: { id: client.id },
            },
            addresses: {
              create: {
                primary_phone_number: user.phone_number,
                street: user.street,
                region: user.region,
                city: user.city,
                secondery_phone_number: user.secondery_phone,
                created_at: moment().format(),
                updated_at: moment().format(),
              },
            },
            accounts: {
              create: {
                email: user.email,
                account_type: Role.CLIENT,
                created_at: moment().format(),
                updated_at: moment().format(),
              },
            },
            created_at: moment().format(),
            updated_at: moment().format(),
          },
        });

        // send emails to users after adding them to database
        try {
          await this.mailService.sendMail({
            to: user.email,
            subject: 'Welcome to AiliPay App!',
            template: 'welcome',
            context: {
              name: user.name,
              employee_id: employee_id,
            },
          });
        } catch (error) {
          this.logger.error(`${logPrefix()} ${error}`);
          throw new HttpException(
            `server error: ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      });
    }

    return client;
  }

  async findAll() {
    const clients = await this.prismaService.clients.findMany({
      include: {
        accounts: {
          select: {
            email: true,
            account_status: true,
            account_type: true,
            confirm_secret: true,
            activation_date: true,
            created_at: true,
            updated_at: true,
          },
        },
        addresses: true,
      },
    });

    return clients;
  }

  async findOne(id: number) {
    const client = await this.prismaService.clients.findFirst({
      where: { id },
      include: {
        accounts: {
          select: {
            email: true,
            account_status: true,
            account_type: true,
            confirm_secret: true,
            activation_date: true,
            created_at: true,
            updated_at: true,
          },
        },
        addresses: true,
      },
    });

    return client;
  }

  async update(
    id: number,
    updateClientDto: UpdateClientDto,
    file: Express.Multer.File,
  ) {
    const client = await this.prismaService.clients.findFirst({
      where: { id },
    });
    // Check if the client exists
    if (!client) {
      this.logger.error(
        `${logPrefix()} Error updating Client: Client with id: ${id} not found`,
      );
      throw new HttpException(
        `Error updating Client: Client with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    let updatedClientData;
    const nextPaymentDate = moment(
      updateClientDto.nextPaydate,
      'YYYY-MM-DD',
    ).format();
    try {
      updatedClientData = await this.prismaService.clients.update({
        where: {
          id,
        },
        data: {
          name: updateClientDto.name,
          industry: updateClientDto.industry,
          tax_id: updateClientDto.taxId,
          client_commision: updateClientDto.clientCommision,
          // earning_report_status: createClientDto.earning_report_status,
          next_payment_date: nextPaymentDate,
          employee_roaster_file: file?.filename || null,
          updated_at: moment().format(),
          accounts: {
            update: {
              account_status: updateClientDto.accountStatus,
              updated_at: moment().format(),
            },
          },
          addresses: {
            update: {
              city: updateClientDto.city,
              region: updateClientDto.region,
              street: updateClientDto.street,
              primary_phone_number: updateClientDto.primaryPhone,
              secondery_phone_number: updateClientDto.secondaryPhone,
              updated_at: moment().format(),
            },
          },
        },
        include: {
          addresses: true,
          accounts: true,
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error updating Client`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedClientData;
  }

  async remove(id: number) {
    // Find the client by ID
    const client = await this.prismaService.clients.findUnique({
      where: { id },
    });

    // If the client doesn't exist, throw a NotFoundException
    if (!client) {
      this.logger.error(
        `${logPrefix()} Error Deleting Client: Client with id: ${id} not found`,
      );
      throw new HttpException(
        `Error deleting Client: Client with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // try {
    //   await this.prismaService.accounts.delete({
    //     where: { id: client.account_id },
    //   });

    //   await this.prismaService.addresses.delete({
    //     where: { id: client.address_id },
    //   });
    //   // Delete the client using Prisma client
    //   await this.prismaService.clients.delete({
    //     where: { id },
    //   });
    // } catch (error) {
    //   // Handle any errors that occur during deletion
    //   this.logger.error(`${logPrefix()} ${error}`);
    //   throw new HttpException(
    //     `Error deleteing Client`,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
    try {
      await this.prismaService.clients.update({
        where: {
          id,
        },
        data: {
          updated_at: moment().format(),
          accounts: {
            update: {
              account_status: AccountStatus.DEACTIVATED,
              updated_at: moment().format(),
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error Deleting Client`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getClientInvoices(clientId: number) {
    let invoices;
    try {
      invoices = await this.prismaService.invoices.findMany({
        where: {
          client_id: clientId,
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

  async createClientBank(
    clientId: number,
    createClientBankDto: CreateClientBankDto,
  ) {
    let clientBank;
    try {
      clientBank = await this.prismaService.client_banks.create({
        data: {
          account_number: createClientBankDto.account_number,
          client_id: clientId,
          bank_id: createClientBankDto.bank_id,
          created_at: moment().format(),
          updated_at: moment().format(),
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error creating client bank`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return clientBank;
  }

  async getClientBanks(clientId: number): Promise<any[]> {
    let clientBanks: any[];
    try {
      clientBanks = await this.prismaService.client_banks.findMany({
        where: {
          client_id: clientId,
        },
        include: {
          banks: {
            include: {
              addresses: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error getting client banks: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return clientBanks;
  }
}
