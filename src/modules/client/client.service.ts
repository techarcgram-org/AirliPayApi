import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { create } from 'domain';
import { Role } from 'src/common/constants';
import {
  constructUsersArrayFromCsv,
  generatePasswordHash,
  logPrefix,
} from 'src/common/utils/util';
import * as moment from 'moment';
import { MailService } from 'src/core/mail/mail.service';

@Injectable()
export class ClientService {
  constructor(
    private prismaService: PrismaService,
    private logger: Logger,
    private mailService: MailService,
  ) {}

  async create(createClientDto: CreateClientDto, file: Express.Multer.File) {
    const users = await constructUsersArrayFromCsv(file);
    let client;
    console.log('FILE', file);
    try {
      client = await this.prismaService.clients.create({
        data: {
          name: createClientDto.name,
          industry: createClientDto.industry,
          tax_id: createClientDto.tax_id,
          client_commision: parseInt(createClientDto.client_commision),
          // earning_report_status: createClientDto.earning_report_status,
          next_payment_date: moment(createClientDto.next_payment_date).format(),
          employee_roaster_file: file.filename,
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
              primary_phone_number: createClientDto.primary_phone_number,
              city: createClientDto.city,
              region: createClientDto.region,
              street: createClientDto.street,
              secondery_phone_number: createClientDto.secondery_phone_number,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          },
          created_at: moment().format(),
          updated_at: moment().format(),
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    // Creates account for every user from employee roaster csv
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

    return client;
  }

  findAll() {
    return `This action returns all client`;
  }

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
