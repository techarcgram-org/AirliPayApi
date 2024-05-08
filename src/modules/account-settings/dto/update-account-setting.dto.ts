import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateAccountSettingDto {
  @ApiProperty({
    type: 'string',
    description: 'User prefered language',
  })
  language: string;

  @ApiProperty({
    type: 'string',
    description: 'Users default bnak',
  })
  default_bank_id: number;

  @ApiProperty({
    type: 'string',
    description: 'The users default/prefered mobile money account',
  })
  default_momo_account_id: number;

  @ApiProperty({
    type: 'string',
    description: 'users private security pin for transactions ',
  })
  security_pin: string;

  @ApiProperty({
    type: 'string',
    description: 'users private security pin for transactions ',
  })
  notification_enabled: boolean;

  @ApiProperty({
    type: 'string',
    description: 'enable users personal pin ',
  })
  pin_enabled: boolean;

  @ApiProperty({
    type: 'string',
    description: 'enable users two factor authentication',
  })
  two_fa_enabled: boolean;
}
