import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ListInvoicesDto {
  @ApiProperty({
    type: 'number',
    description:
      'the page number of the invoice you want to retrieve for pagination purposes',
  })
  page: number;

  @ApiProperty({
    type: 'number',
    description: 'the number of items to return ',
  })
  pageSize: number;
}
