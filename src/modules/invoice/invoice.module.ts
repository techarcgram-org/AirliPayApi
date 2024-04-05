import { Logger, Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService, Logger],
  exports: [InvoiceService],
})
export class InvoiceModule {}
