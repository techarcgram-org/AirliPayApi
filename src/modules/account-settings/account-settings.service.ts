import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAccountSettingDto } from './dto/update-account-setting.dto';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/common/services/prisma.service';
import * as moment from 'moment';
import { AddUserBankAccountDto } from './dto/add-user-bank-account.dto';
import { AddUserMobileMoneyAccountDto } from './dto/add-user-mobile-money-account.dto';
import {
  isValidPhoneNumber,
  logPrefix,
  telecomOperator,
} from 'src/common/utils/util';
import { CreateBankDto } from './dto/create-bank.dto';
import { banks } from '@prisma/client';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class AccountSettingsService {
  constructor(
    private userService: UserService,
    private prismaService: PrismaService,
    private logger: Logger,
    private appConfig: AppConfigService,
  ) {}

  async create(userID: number) {
    return await this.prismaService.account_settings.create({
      data: {
        user_id: userID,
        created_at: moment().format(),
        updated_at: moment().format(),
      },
    });
  }

  async addBank(createBankDto: CreateBankDto) {
    let bank: banks;
    try {
      bank = await this.prismaService.banks.create({
        data: {
          ...createBankDto,
          created_at: moment().format(),
          updated_at: moment().format(),
        },
      });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `Error creating new bank`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (!bank) throw new NotFoundException('bank not found');
    return bank;
  }

  async update(
    updateAccountSettingDto: UpdateAccountSettingDto,
    userId: number,
  ) {
    let accountSettings;
    try {
      accountSettings =
        userId &&
        (await this.prismaService.account_settings.findFirst({
          where: {
            user_id: userId,
          },
        }));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
    let user;
    try {
      user = await this.prismaService.account_settings.update({
        data: {
          ...updateAccountSettingDto,
          updated_at: moment().format(),
        },
        where: {
          id: accountSettings.id,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
    return user;
  }

  async addUserBankAccount(
    userId: number,
    addUserBankAccountDto: AddUserBankAccountDto,
  ) {
    return await this.prismaService.user_banks.create({
      data: {
        ...addUserBankAccountDto,
        user_id: userId,
        created_at: moment().format(),
        updated_at: moment().format(),
      },
    });
  }

  async addUserMobileMoneyAccount(
    userId: number,
    addUserMobileMoneyAccount: AddUserMobileMoneyAccountDto,
  ) {
    if (!isValidPhoneNumber(addUserMobileMoneyAccount.phone_number)) {
      return false;
    }
    const operator = telecomOperator(addUserMobileMoneyAccount.phone_number);
    return await this.prismaService.user_mobile_money_accounts.create({
      data: {
        ...addUserMobileMoneyAccount,
        operator,
        user_id: userId,
        created_at: moment().format(),
        updated_at: moment().format(),
      },
    });
  }
}
