import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { account_status_types } from '@prisma/client';

export class UpdateAdminDto {
  @ApiProperty({
    type: 'string',
    description: 'Name of Admin',
  })
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Role of Admin',
  })
  role: number;

  @ApiProperty({
    type: 'string',
    description: 'Admin email address - also used for authentication',
  })
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'Admin email address - also used for authentication',
  })
  primaryPhone: string;

  @ApiProperty({
    type: 'string',
    description: 'Admin email address - also used for authentication',
  })
  city: string;

  @ApiProperty({
    type: 'string',
    description: 'Admin email address - also used for authentication',
  })
  region: string;

  @ApiProperty({
    type: 'string',
    description: 'Admin email address - also used for authentication',
  })
  street: string;

  @ApiProperty({
    type: 'string',
    description: 'Admin email address - also used for authentication',
  })
  mobileMoneyNumber: string;

  @ApiProperty({
    type: 'string',
    description: 'Admin email address - also used for authentication',
  })
  secondaryPhone: string;

  @ApiProperty({
    type: 'string',
    description: 'Admin password',
  })
  password: string;

  @ApiProperty({
    type: 'string',
    description: 'Admin accountStatus',
  })
  accountStatus: account_status_types;
}
