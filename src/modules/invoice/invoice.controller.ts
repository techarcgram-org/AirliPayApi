import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { ListInvoicesDto } from './dto/list-invoices.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll(@Body() listInvoicesDto: ListInvoicesDto) {
    return await this.invoiceService.findAll(listInvoicesDto);
  }
}
