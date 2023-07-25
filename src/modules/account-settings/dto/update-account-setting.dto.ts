import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateAccountSettingDto {
  @ApiProperty({
    type: 'string',
    description: 'User prefered language',
  })
  @IsString()
  prefered_language: string;

  @ApiProperty({
    type: 'string',
    description: 'Users default bnak',
  })
  @IsNumber()
  default_bank: number;

  @ApiProperty({
    type: 'string',
    description: 'The users default/prefered mobile money account',
  })
  @IsNumber()
  default_momo_account_id: number;

  @ApiProperty({
    type: 'string',
    description: 'users private security pin for transactions ',
  })
  @IsString()
  security_pin: string;

  @ApiProperty({
    type: 'string',
    description: 'users private security pin for transactions ',
  })
  @IsBoolean()
  notification_enabled: boolean;
}
