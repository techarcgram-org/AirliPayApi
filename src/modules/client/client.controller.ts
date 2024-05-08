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

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

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
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createClientDto: CreateClientDto,
  ) {
    return this.clientService.create(createClientDto, file);
  }

  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(+id);
  }

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
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.clientService.update(+id, updateClientDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(+id);
  }
}
