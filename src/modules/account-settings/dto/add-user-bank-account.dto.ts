import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddUserBankAccountDto {
  @ApiProperty({
    type: 'string',
    description: 'User bank account number',
  })
  @IsNotEmpty()
  @IsString()
  account_number: string;

  @ApiProperty({
    type: 'string',
    description: 'bank id',
  })
  @IsNotEmpty()
  @IsNumber()
  bank_id: number;
}
