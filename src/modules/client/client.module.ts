import { Logger, Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { CsvModule } from 'nest-csv-parser';

@Module({
  imports: [CsvModule],
  controllers: [ClientController],
  providers: [ClientService, PrismaService, Logger],
  exports: [ClientService],
})
export class ClientModule {}
