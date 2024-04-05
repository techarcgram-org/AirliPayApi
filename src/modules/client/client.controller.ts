import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  csvDestination,
  csvFileFilter,
  csvFileName,
} from 'src/common/utils/util';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateClientBankDto } from './dto/create-client-bank.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/employee-roasters',
        filename: csvFileName,
      }),
      fileFilter: csvFileFilter,
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createClientDto: CreateClientDto,
  ) {
    return await this.clientService.create(createClientDto, file);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll() {
    return await this.clientService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.clientService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/employee-roasters',
        filename: csvFileName,
      }),
      fileFilter: csvFileFilter,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.clientService.update(+id, updateClientDto, file);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.clientService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':client_id/banks')
  async getClientBanks(@Param('client_id') clientId: number) {
    return await this.clientService.getClientBanks(clientId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post(':client_id/banks')
  async createClientBank(
    @Param('client_id') clientId: number,
    @Body() createClientBankDto: CreateClientBankDto,
  ) {
    return await this.clientService.createClientBank(
      clientId,
      createClientBankDto,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':client_id/invoices')
  async clientInvoices(@Param('client_id') client_id: number) {
    return this.clientService.getClientInvoices(client_id);
  }
}
