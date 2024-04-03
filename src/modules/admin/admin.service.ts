import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AccountStatus, Role } from 'src/common/constants';
import * as moment from 'moment';
import { PrismaService } from 'src/common/services/prisma.service';
import { Prisma } from '@prisma/client';
import { generatePasswordHash, logPrefix } from 'src/common/utils/util';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private logger: Logger,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    let admin;
    const hashedPassword = generatePasswordHash(createAdminDto.password);
    try {
      admin = await this.prismaService.admins.create({
        data: {
          name: createAdminDto.name,
          role: createAdminDto.role,
          accounts: {
            create: {
              email: createAdminDto.email,
              account_type: Role.ADMIN,
              encrypted_password: hashedPassword,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          },
          addresses: {
            create: {
              city: createAdminDto.city,
              region: createAdminDto.region,
              street: createAdminDto.street,
              primary_phone_number: createAdminDto.primaryPhone,
              secondery_phone_number: createAdminDto.secondaryPhone,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          },
          created_at: moment().format(),
          updated_at: moment().format(),
        },
        include: {
          accounts: true,
          addresses: true,
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
          `Error creating admin: ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return admin;
  }

  async findAll() {
    const admins = await this.prismaService.admins.findMany({
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

    return admins;
  }

  async findOne(id: number) {
    const admin = await this.prismaService.admins.findFirst({
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

    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const admin = await this.prismaService.admins.findFirst({
      where: { id },
    });
    // Check if the client exists
    if (!admin) {
      this.logger.error(
        `${logPrefix()} Error updating Admin: Admin with id: ${id} not found`,
      );
      throw new HttpException(
        `Error updating Admin: Admin with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    let updatedAdminData;
    try {
      updatedAdminData = await this.prismaService.admins.update({
        where: {
          id,
        },
        data: {
          name: updateAdminDto.name,
          role: updateAdminDto.role,
          updated_at: moment().format(),
          accounts: {
            update: {
              account_status: updateAdminDto.accountStatus,
              updated_at: moment().format(),
            },
          },
          addresses: {
            update: {
              city: updateAdminDto.city,
              region: updateAdminDto.region,
              street: updateAdminDto.street,
              primary_phone_number: updateAdminDto.primaryPhone,
              secondery_phone_number: updateAdminDto.secondaryPhone,
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
        `Error updating Admin`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedAdminData;
  }

  async remove(id: number) {
    // Find the client by ID
    const admin = await this.prismaService.admins.findUnique({
      where: { id },
    });

    // If the client doesn't exist, throw a NotFoundException
    if (!admin) {
      this.logger.error(
        `${logPrefix()} Error Deleting Admin: Admin with id: ${id} not found`,
      );
      throw new HttpException(
        `Error deleting Admin: Admin with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      await this.prismaService.admins.update({
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
        `Error Deleting Admins`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
