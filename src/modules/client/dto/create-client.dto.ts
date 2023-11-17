import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
  tax_id: string;

  @ApiProperty({
    type: 'int',
    description: 'client/employer commision to be earned from payments',
  })
  client_commision: string;

  @ApiProperty({
    type: 'boolean',
    description: 'client/employer empplyees earning report status',
  })
  earning_report_status: boolean;

  @ApiProperty({
    type: 'string',
    description: 'client/employer next date of payment',
  })
  next_payment_date: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer list of employees file in CSV format',
  })
  employee_roaster_file: string;

  @ApiProperty({
    type: 'string',
    description: "client/employer's bank name",
  })
  bank_name: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer list of employees file in CSV format',
  })
  account_number: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  primary_phone_number: string;

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
  mobile_money_number: string;

  @ApiProperty({
    type: 'string',
    description: 'client/employer email address - also used for authentication',
  })
  secondery_phone_number: string;
}
