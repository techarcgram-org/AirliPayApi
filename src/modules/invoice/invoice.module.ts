import { Logger, Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { ClientModule } from '../client/client.module';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService, Logger],
  imports: [ClientModule],
  exports: [InvoiceService],
})
export class InvoiceModule {}
