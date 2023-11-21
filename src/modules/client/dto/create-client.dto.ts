import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClientDto {
  @ApiProperty({
    type: 'string',
    description: 'Name of client/employer',
  })
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Industry client/employer belongs to',
  })
  industry: string;

  @ApiProperty({
    type: 'string',
    description: 'TaxId of client/employer',
  })
  taxId: string;

  @ApiProperty({
    type: 'int',
    description: 'client/employer commision to be earned from payments',
  })
  clientCommision: number;

  @ApiProperty({
    type: 'boolean',
    description: 'client/employer empplyees earning report status',
  })
  @Transform(({ value }) => value === 'true')
  earningReportStatus: boolean;

  @ApiProperty({
    type: 'string',
    description: 'client/employer next date of payment',
  })
  nextPaymentDate: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer list of employees file in CSV format',
  })
  file: string;

  @ApiProperty({
    type: 'string',
    description: "client/employer's bank name",
  })
  bank: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer list of employees file in CSV format',
  })
  bankdAccountNumber: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  primaryPhone: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  city: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  region: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  street: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  mobileMoneyNumber: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  secondaryPhone: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer password',
  })
  password: string;
}
