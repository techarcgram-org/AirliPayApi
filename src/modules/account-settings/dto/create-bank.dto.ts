import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBankDto {
  @ApiProperty({
    type: 'string',
    description: 'bank name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'bank address id',
  })
  @IsNotEmpty()
  address_id: number;

  @ApiProperty({
    type: 'string',
    description: 'is bank an airlipay user?',
  })
  is_partner: boolean;

  @ApiProperty({
    type: 'string',
    description: 'does bank support API operations?',
  })
  supports_api: boolean;
}
