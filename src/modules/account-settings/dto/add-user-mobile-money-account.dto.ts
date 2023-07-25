import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddUserMobileMoneyAccountDto {
  @ApiProperty({
    type: 'string',
    description: 'User bank account number',
  })
  @IsNotEmpty()
  @IsString()
  phone_number: string;
}
