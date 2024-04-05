import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClientBankDto {
  @ApiProperty({
    type: 'string',
    description: 'bank account number of client',
  })
  account_number: string;

  @ApiProperty({
    type: 'number',
    description: 'The ID of the bank the client belongs to',
  })
  bank_id: number;
}
