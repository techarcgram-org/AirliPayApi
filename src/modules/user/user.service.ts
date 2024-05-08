import {
  Injectable,
  NotFoundException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { gen } from 'n-digit-token';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSession, UserWithAccounts } from 'src/common/types/user.type';
import { PrismaService } from 'src/common/services/prisma.service';
import { MailService } from 'src/core/mail/mail.service';
import * as moment from 'moment';
import { AccountStatus, Role } from 'src/common/constants';
import {
  constructUsersArrayFromCsv,
  generatePasswordHash,
  logPrefix,
} from 'src/common/utils/util';
import { Prisma, banks } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private mailService: MailService,
    private logger: Logger,
  ) {}

  async get() {
    const users = await this.prismaService.users.findMany({
      include: {
        accounts: {
          select: {
            email: true,
            account_status: true,
            account_type: true,
            confirm_secret: true,
          },
        },
        addresses: true,
      },
    });

    const flattenedUsers = [];
    users.forEach((parent) => {
      parent = { ...parent, ...parent.accounts, ...parent.addresses };
      delete parent.accounts;
      delete parent.addresses;
      flattenedUsers.push(parent);
    });
    return flattenedUsers;
  }

  async findOne(id: number) {
    const user = await this.prismaService.users.findFirst({
      where: { id },
      include: {
        accounts: {
          select: {
            email: true,
            account_status: true,
            account_type: true,
            confirm_secret: true,
          },
        },
        addresses: true,
      },
    });

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    let user;
    let employee_id;
    let client;
    try {
      client = await this.prismaService.clients.findFirst({
        where: {
          id: createUserDto.clientId,
        },
      });
      const random = (Math.random() + 1).toString(36).substring(4);
      employee_id =
        client.name.toLocaleLowerCase().slice(0, 2) +
        createUserDto.name.toLocaleLowerCase().slice(0, 2) +
        random;
      user = await this.prismaService.users.create({
        data: {
          name: createUserDto.name,
          base_salary: createUserDto.baseSalary,
          employee_id: employee_id,
          sex: createUserDto.sex,
          photo: createUserDto.photo,
          dob: moment(createUserDto.dob, 'DD/MM/YYY').format(),
          clients: {
            connect: {
              id: createUserDto.clientId,
            },
          },
          accounts: {
            create: {
              email: createUserDto.email,
              account_type: Role.USER,
              created_at: moment().format(),
              updated_at: moment().format(),
            },
          },
          addresses: {
            create: {
              city: createUserDto.city,
              region: createUserDto.region,
              street: createUserDto.street,
              primary_phone_number: createUserDto.primaryPhone,
              secondery_phone_number: createUserDto.secondaryPhone,
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

    try {
      await this.mailService.sendMail({
        to: createUserDto.email,
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
        `Error sending email: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return user;
  }

  // adds bulk list of users using csv file
  async bulkCreate(file: Express.Multer.File, clientId: number) {
    const users = await constructUsersArrayFromCsv(file);
    const userList = [];
    const client = await this.prismaService.clients.findFirst({
      where: {
        id: clientId,
      },
    });

    await Promise.all(
      users.map(async (user) => {
        try {
          const random = (Math.random() + 1).toString(36).substring(4);
          const employee_id =
            client.name.toLocaleLowerCase().slice(0, 2) +
            user.name.toLocaleLowerCase().slice(0, 2) +
            random;
          userList.push(
            await this.prismaService.users.create({
              data: {
                name: user.name,
                base_salary: user.baseSalary,
                employee_id: employee_id,
                sex: user.sex,
                photo: user.photo,
                dob: moment(user.dob, 'DD/MM/YYY').format(),
                clients: {
                  connect: {
                    id: clientId,
                  },
                },
                accounts: {
                  create: {
                    email: user.email,
                    account_type: Role.USER,
                    created_at: moment().format(),
                    updated_at: moment().format(),
                  },
                },
                addresses: {
                  create: {
                    primary_phone_number: user.phoneNumber,
                    secondery_phone_number: user.secondaryPhone,
                    city: user.city,
                    region: user.region,
                    street: user.street,
                    created_at: moment().format(),
                    updated_at: moment().format(),
                  },
                },
                created_at: moment().format(),
                updated_at: moment().format(),
              },
            }),
          );
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

        try {
          await this.mailService.sendMail({
            to: user.email,
            subject: 'Welcome to AiliPay App!',
            template: 'welcome',
            context: {
              name: user.name,
              employee_id: user.employee_id,
            },
          });
        } catch (error) {
          this.logger.error(`${logPrefix()} ${error}`);
          throw new HttpException(
            `Error sending email: ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }),
    );

    return userList;
  }

  async getAirlipays(id: number) {
    return await this.prismaService.early_transactions.findMany({
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
      where: {
        user_id: id,
      },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  async sendEmailVerificationCode(user: UserWithAccounts) {
    const secret = gen(5);

    try {
      await this.mailService.sendMail({
        to: user.accounts.email,
        subject: 'Welcome to AiliPay App! Confirm your Email',
        template: 'transactional', // either change to ./transactional or rename transactional.html to confirmation.html
        context: {
          name: user.name,
          secret,
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      return { message: 'failed sending confirmation email', code: 0 };
    }

    try {
      await this.prismaService.accounts.update({
        where: {
          id: user.account_id,
        },
        data: {
          confirm_secret: secret,
          email_confirmation_sent_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      return { message: 'error updating secret', code: 0 };
    }
    return { message: 'email sent successfully', code: 1 };
  }

  async verifyEmailCode(secret: string, user: UserWithAccounts) {
    const emailConfirmDatePlusOneHour = moment(
      user.accounts.email_confirmation_sent_at,
    ).add(1, 'h');
    const now = moment();
    if (
      user.accounts.confirm_secret == secret &&
      now <= emailConfirmDatePlusOneHour
    ) {
      try {
        await this.prismaService.accounts.update({
          where: {
            id: user.account_id,
          },
          data: {
            email_confirmed: true,
            confirm_secret: null,
          },
        });
      } catch (error) {
        this.logger.error(`${logPrefix()} ${error}`);
        return { message: error, code: 0 };
      }
      return { message: 'verification success success', code: 1 };
    } else {
      return { message: 'invalid token', code: 0 };
    }
  }

  async findOneByEmployeeId(
    employeeId: string,
  ): Promise<UserWithAccounts | undefined> {
    const user = await this.prismaService.users.findFirst({
      where: {
        employee_id: employeeId,
      },
      include: {
        addresses: true,
        accounts: true,
      },
    });

    if (!user) throw new NotFoundException();
    return user;
  }

  async findOneById(userId: number): Promise<UserWithAccounts | undefined> {
    const user = await this.prismaService.users.findFirst({
      where: {
        id: userId,
      },
      include: {
        addresses: true,
        accounts: true,
      },
    });

    if (!user) throw new NotFoundException();
    return user;
  }

  async listBanks(): Promise<banks[]> {
    let banks: banks[];
    try {
      banks = await this.prismaService.banks.findMany();
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return banks;
  }

  async listUserBanks(user: UserSession): Promise<any[]> {
    let userBanks: any[];
    try {
      userBanks = await this.prismaService.user_banks.findMany({
        where: {
          user_id: user.sub,
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
        `server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return userBanks;
  }

  async findOneByEmail(email: string): Promise<UserWithAccounts | undefined> {
    let user: UserWithAccounts;
    try {
      user = await this.prismaService.users.findFirst({
        where: {
          accounts: {
            email: email,
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
        `server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!user) throw new NotFoundException();
    return user;
  }

  async createPassword(password: string, user: UserWithAccounts) {
    const hashedPassword = generatePasswordHash(password);
    try {
      await this.prismaService.accounts.update({
        where: {
          id: user.account_id,
        },
        data: {
          encrypted_password: hashedPassword,
          account_status: AccountStatus.ACTIVE,
        },
      });
    } catch (error) {
      console.log(error);
      return { message: 'creating password failed', code: 0 };
    }
    return { message: 'password successfully created', code: 1 };
  }

  async sendPasswordResetEmail(email: string) {
    const secret = gen(5);
    const user = await this.findOneByEmail(email);

    try {
      await this.mailService.sendMail({
        to: user.accounts.email,
        subject: 'AirliPay Password Reset',
        template: 'transactional', // either change to ./transactional or rename transactional.html to confirmation.html
        context: {
          name: user.name,
          secret,
        },
      });
    } catch (error) {
      console.log(error);
      return { message: 'failed sending reset email', code: 0 };
    }

    try {
      await this.prismaService.accounts.update({
        where: {
          id: user.account_id,
        },
        data: {
          reset_password_token: secret,
          reset_password_sent_at: new Date(),
        },
      });
    } catch (error) {
      console.log(error);
      return { message: 'error updating secret', code: 0 };
    }
    return { message: 'reset email sent successfully', code: 1 };
  }

  async verifyResetToken(token: string, email: string): Promise<any> {
    const user = await this.findOneByEmail(email);
    if (
      user.accounts.reset_password_token == token &&
      !this.isTokenExpired(user.accounts.reset_password_sent_at)
    ) {
      try {
        await this.prismaService.accounts.update({
          where: {
            id: user.account_id,
          },
          data: {
            reset_password_token: null,
          },
        });
      } catch (error) {
        console.log(error);
        return { message: error, code: 0 };
      }
      return { message: 'verification success success', code: 1 };
    } else {
      return { message: 'invalid token', code: 0 };
    }
  }

  async saveResetToken(email: string, resetToken: string) {
    // Save the reset token and its expiry in your database
    // Example: Update the user document with the reset token and its expiry
  }

  private isTokenExpired(tokenCreatedAtTime: Date): boolean {
    const emailConfirmDatePlusOneHour = moment(tokenCreatedAtTime).add(1, 'h');
    const now = moment();
    return now > emailConfirmDatePlusOneHour;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.users.findFirst({
      where: { id },
    });

    // Check if the user exists
    if (!user) {
      this.logger.error(
        `${logPrefix()} Error updating User: User with id: ${id} not found`,
      );
      throw new HttpException(
        `Error updating User: User with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    let updatedUserData;
    try {
      if (updateUserDto.userBanksId) {
        await this.prismaService.user_banks.update({
          where: {
            id: updateUserDto.userBanksId,
          },
          data: {
            bank_id: updateUserDto.bankId,
            account_number: updateUserDto.accountNumber,
            updated_at: moment().format(),
          },
        });
      }
      updatedUserData = await this.prismaService.users.update({
        where: {
          id,
        },
        data: {
          name: updateUserDto.name,
          base_salary: updateUserDto.baseSalary,
          next_payment_date: updateUserDto.nextPaymentDate,
          received_earlypay: updateUserDto.receivedEarlyPay,
          dob: updateUserDto.dob,
          photo: updateUserDto.photo,
          sex: updateUserDto.sex,
          updated_at: moment().format(),
          accounts: {
            update: {
              account_status: updateUserDto.accountStatus,
              updated_at: moment().format(),
            },
          },
          addresses: {
            update: {
              city: updateUserDto.city,
              region: updateUserDto.region,
              street: updateUserDto.street,
              primary_phone_number: updateUserDto.primaryPhone,
              secondery_phone_number: updateUserDto.seconddaryPhone,
              updated_at: moment().format(),
            },
          },
        },
        include: {
          addresses: true,
          user_banks: true,
          accounts: true,
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error updating User`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedUserData;
  }

  async remove(id: number) {
    // Find the user by ID
    const user = await this.prismaService.users.findUnique({
      where: { id },
    });

    // If the user doesn't exist, throw a NotFoundException
    if (!user) {
      this.logger.error(
        `${logPrefix()} Error deleting User: User with id: ${id} not found`,
      );
      throw new HttpException(
        `Error deleting User: User with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      await this.prismaService.users.update({
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
        `Error Deleting User`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
