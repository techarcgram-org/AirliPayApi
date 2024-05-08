import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({
    type: 'string',
    description: 'amount to withdraw',
  })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    type: 'string',
    description: 'phone number to transfer to',
  })
  phoneNumber: string;
}
