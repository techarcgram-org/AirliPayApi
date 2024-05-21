import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Res,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AccountSettingsService } from './account-settings.service';
import { UpdateAccountSettingDto } from './dto/update-account-setting.dto';
import { AuthGuard } from '../auth/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AddUserBankAccountDto } from './dto/add-user-bank-account.dto';
import { formatResponse } from 'src/common/lib/helpers';
import { AddUserMobileMoneyAccountDto } from './dto/add-user-mobile-money-account.dto';
import { CreateBankDto } from './dto/create-bank.dto';
import { Response } from 'express';
import { UserSession } from 'src/common/types/user.type';

@Controller('account-settings')
export class AccountSettingsController {
  constructor(
    private readonly accountSettingsService: AccountSettingsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findAll(@GetUser() user) {
    return 'okay';
  }

  @Post('/add-bank')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createBank(
    @Body() createBankDto: CreateBankDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.accountSettingsService.addBank(createBankDto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.accountSettingsService.findOne(+id);
  // }

  @Patch(':id/update')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('id') user_id: string,
    @Res({ passthrough: true }) res,
    @Body() updateAccountSettingDto: UpdateAccountSettingDto,
  ) {
    const result = await this.accountSettingsService.update(
      updateAccountSettingDto,
      Number(user_id),
    );
    if (!result) {
      return formatResponse(result, res, HttpStatus.BAD_REQUEST);
    }
    return formatResponse(result, res, HttpStatus.OK);
  }

  @Post('/add-user-bank-account')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async addUserBankAccount(
    @Res({ passthrough: true }) res: Response,
    @GetUser() user,
    @Body() addUserBankAccountDto: AddUserBankAccountDto,
  ) {
    const result = await this.accountSettingsService.addUserBankAccount(
      user.sub,
      addUserBankAccountDto,
    );
    if (!result) {
      return formatResponse(result, res, HttpStatus.BAD_REQUEST);
    }
    return formatResponse(result, res, HttpStatus.OK);
  }

  @Post('/add-user-momo-account')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async addUserMobileMoneyAccount(
    @Res({ passthrough: true }) res,
    @GetUser() user,
    @Body() addUserMobileMoneyAccountDto: AddUserMobileMoneyAccountDto,
  ) {
    const result = await this.accountSettingsService.addUserMobileMoneyAccount(
      user,
      addUserMobileMoneyAccountDto,
    );
    if (!result) {
      return formatResponse(result, res, HttpStatus.BAD_REQUEST);
    }
    return formatResponse(result, res, HttpStatus.OK);
  }

  @Get('/list-user-momo-accounts')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async listMomoAccounts(@Res({ passthrough: true }) res, @GetUser() user) {
    const result = await this.accountSettingsService.listUserMomoAccounts(user);
    if (!result) {
      return formatResponse(result, res, HttpStatus.BAD_REQUEST);
    }
    return formatResponse(result, res, HttpStatus.OK);
  }

  @Get('/get-user-account-settings')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getUserAccountSettings(
    @Res({ passthrough: true }) res,
    @GetUser() user,
  ) {
    const result = await this.accountSettingsService.getUserAccountSettings(
      user,
    );
    if (!result) {
      return formatResponse(result, res, HttpStatus.BAD_REQUEST);
    }
    return formatResponse(result, res, HttpStatus.OK);
  }
}
