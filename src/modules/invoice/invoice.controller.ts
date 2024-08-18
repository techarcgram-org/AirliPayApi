import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  Put,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { ListInvoicesDto } from './dto/list-invoices.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { users } from '@prisma/client';
import { ClientService } from '../client/client.service';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private clientService: ClientService,
  ) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll(
    @Body() listInvoicesDto: ListInvoicesDto,
    @GetUser() user: any,
  ) {
    if (user.roles.includes('ADMIN')) {
      return await this.invoiceService.findAll(listInvoicesDto);
    } else {
      return await this.clientService.getClientInvoices(user.sub);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':id/transactions')
  async allInvoiceTransactions(@Param('id') id: number) {
    return await this.invoiceService.invoiceTransactions(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put(':id/update-status')
  async updateInvoiceStatus(
    @Param('id') id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return await this.invoiceService.updateInvoiceStatus(id, updateInvoiceDto);
  }
}
