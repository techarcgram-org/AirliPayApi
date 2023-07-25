import { Injectable } from '@nestjs/common';
import { CreateAccountSettingDto } from './dto/create-account-setting.dto';
import { UpdateAccountSettingDto } from './dto/update-account-setting.dto';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/common/services/prisma.service';
import * as moment from 'moment';
import { AddUserBankAccountDto } from './dto/add-user-bank-account.dto';
import { AddUserMobileMoneyAccountDto } from './dto/add-user-mobile-money-account.dto';
import { isValidPhoneNumber, telecomOperator } from 'src/common/utils/util';
import { CreateBankDto } from './dto/create-bank.dto';

@Injectable()
export class AccountSettingsService {
  constructor(
    private userService: UserService,
    private prismaService: PrismaService,
  ) {}

  async addBank(createBankDto: CreateBankDto) {
    const bank = await this.prismaService.banks.create({
      data: {
        ...createBankDto,
        created_at: moment().format(),
        updated_at: moment().format(),
      },
    });
    if (!bank) return { message: 'creating bank failed', code: 0 };
    return { message: 'Creating bank success', code: 1 };
  }

  async update(
    updateAccountSettingDto: UpdateAccountSettingDto,
    userId: number,
  ) {
    const accountSettings = await this.prismaService.account_settings.findFirst(
      {
        where: {
          user_id: userId,
        },
      },
    );
    return await this.prismaService.account_settings.update({
      data: {
        ...updateAccountSettingDto,
        updated_at: moment().format(),
      },
      where: {
        id: accountSettings.id,
      },
    });
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
