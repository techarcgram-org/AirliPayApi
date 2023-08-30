import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AirlipayBalanceService } from './airlipay-balance.service';

import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserSession } from 'src/common/types/user.type';
import { WithdrawDto } from './dto/withdraw.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

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
}
