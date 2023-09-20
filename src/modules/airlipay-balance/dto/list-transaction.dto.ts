import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ListTransactionDto {
  @ApiProperty({
    type: 'string',
    description: 'the status of the transaction you want to retrieve',
  })
  status: string;

  @ApiProperty({
    type: 'string',
    description:
      'the type of transaction you want to retrieve either DEPOSIT or WITHDRAWAL',
  })
  type: string;

  @ApiProperty({
    type: 'number',
    description:
      'the page number of the transaction you want to retrieve for pagination purposes',
  })
  page: number;

  @ApiProperty({
    type: 'number',
    description: 'the number of items to return ',
  })
  pageSize: number;
}
