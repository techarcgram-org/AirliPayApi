import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateAirlipayBalanceDto {
  id: bigint;
  @ApiProperty({
    type: 'number',
    description: 'balance to update',
  })
  @IsNotEmpty()
  balance: number;

  @ApiProperty({
    type: 'number',
    description: 'id of the last transaction that updated the balance',
  })
  @IsNotEmpty()
  early_withdrawal_transaction_id: bigint;
}
