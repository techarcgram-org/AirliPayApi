import { Injectable, NotFoundException } from '@nestjs/common';
import { gen } from 'n-digit-token';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserWithAccounts } from 'src/types/user.type';
import { PrismaService } from 'src/services/prisma.service';
import { MailService } from 'src/mail/mail.service';
import moment from 'moment';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private code;
  private saltRounds = 12;

  constructor(
    private readonly prismaService: PrismaService,
    private mailService: MailService,
  ) {
    this.code = Math.floor(1000 + Math.random() * 90000);
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
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
      console.log(error);
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
      console.log(error);
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
        console.log(error);
        return { message: error, code: 0 };
      }
      return { message: 'verification success success', code: 1 };
    } else {
      return { message: 'invalid token', code: 0 };
    }
  }

  async findOne(employeeId: string): Promise<UserWithAccounts | undefined> {
    const user = await this.prismaService.users.findFirst({
      where: {
        employee_id: employeeId,
      },
      include: {
        accounts: {
          include: {
            addresses: true,
          },
        },
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
        accounts: {
          include: {
            addresses: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException();
    return user;
  }

  async findOneByEmail(email: string): Promise<UserWithAccounts | undefined> {
    const user = await this.prismaService.users.findFirst({
      where: {
        accounts: {
          email: email,
        },
      },
      include: {
        accounts: {
          include: {
            addresses: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException();
    return user;
  }

  async createPassword(password: string, user: UserWithAccounts) {
    const hashedPassword = this.generatePasswordHash(password);
    try {
      await this.prismaService.accounts.update({
        where: {
          id: user.account_id,
        },
        data: {
          encrypted_password: hashedPassword,
        },
      });
    } catch (error) {
      console.log(error);
      return { message: 'creating password failed', code: 0 };
    }
    return { message: 'password successfully created', code: 1 };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  generatePasswordHash(password: string): string {
    const salt = bcrypt.genSaltSync(this.saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
