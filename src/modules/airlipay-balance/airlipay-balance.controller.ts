import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { AirlipayBalanceService } from './airlipay-balance.service';

import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserSession } from 'src/common/types/user.type';
import { WithdrawDto } from './dto/withdraw.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ListTransactionDto } from './dto/list-transaction.dto';
import { ACGuard, UseRoles, UserRoles } from 'nest-access-control';

@Controller('airlipay-balance')
export class AirlipayBalanceController {
  constructor(
    private readonly airlipayBalanceService: AirlipayBalanceService,
  ) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('/withdraw')
  async widthdraw(
    @Res({ passthrough: true }) res,
    @Body() withdraw: WithdrawDto,
    @GetUser() user: UserSession,
  ) {
    return await this.airlipayBalanceService.withdraw(
      user,
      withdraw.amount,
      withdraw.phoneNumber,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/transactions')
  async listTransactions(
    @Res({ passthrough: true }) res,
    @Body() listTransactionDto: ListTransactionDto,
    @GetUser() user: any,
  ) {
    return await this.airlipayBalanceService.listWithdrawalTransactions(
      user,
      listTransactionDto,
    );
  }
}
