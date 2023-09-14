import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAccountSettingDto } from './dto/update-account-setting.dto';
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
import {
  account_settings,
  banks,
  user_mobile_money_accounts,
} from '@prisma/client';
import { UserSession } from 'src/common/types/user.type';

@Injectable()
export class AccountSettingsService {
  constructor(private prismaService: PrismaService, private logger: Logger) {}

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
    let settings;
    try {
      settings = await this.prismaService.account_settings.update({
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
    return settings;
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
    user: UserSession,
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
        user_id: user.sub,
        created_at: moment().format(),
        updated_at: moment().format(),
      },
    });
  }

  async listUserMomoAccounts(
    user: UserSession,
  ): Promise<user_mobile_money_accounts[]> {
    let userMomoAccoutns: user_mobile_money_accounts[];
    try {
      userMomoAccoutns =
        await this.prismaService.user_mobile_money_accounts.findMany({
          where: {
            user_id: user.sub,
          },
        });
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return userMomoAccoutns;
  }

  async getUserAccountSettings(user: UserSession): Promise<account_settings> {
    let userAccountSettings: account_settings;
    try {
      userAccountSettings = await this.prismaService.account_settings.findFirst(
        {
          where: {
            user_id: user.sub,
          },
        },
      );
    } catch (error) {
      this.logger.error(`${logPrefix()} ${error}`);
      throw new HttpException(
        `server error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return userAccountSettings;
  }
}
