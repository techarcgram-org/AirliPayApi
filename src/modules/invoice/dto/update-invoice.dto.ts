import { ApiProperty } from '@nestjs/swagger';
import { invoice_status } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class UpdateInvoiceDto {
  @ApiProperty({
    type: 'enum',
    description: 'this is the status of the invoice',
  })
  status: invoice_status;
}
