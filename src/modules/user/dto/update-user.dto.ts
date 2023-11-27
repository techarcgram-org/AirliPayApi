import { ApiProperty } from '@nestjs/swagger';
import { account_status_types } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    type: 'string',
    description: 'Employees full name',
  })
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees email',
  })
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees base salarry',
  })
  baseSalary: number;

  @ApiProperty({
    type: 'string',
    description: 'Employees date of birth',
  })
  dob: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees sex',
  })
  sex: string;

  @ApiProperty({
    type: 'string',
    description: 'Picture of employee',
  })
  photo: string;

  @ApiProperty({
    type: 'string',
    description: "Employee's client",
  })
  clientId: number;

  @ApiProperty({
    type: 'string',
    description: 'Employees city where he lives',
  })
  city: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees street where he lives',
  })
  street: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees region where he lives',
  })
  region: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees primary phone',
  })
  primaryPhone: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees secondary phone',
  })
  seconddaryPhone: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees next payment date',
  })
  nextPaymentDate: string;

  @ApiProperty({
    type: 'string',
    description: 'Has empolyee received first airlipay ',
  })
  receivedEarlyPay: boolean;

  @ApiProperty({
    type: 'string',
    description: 'Employees bank account number',
  })
  accountNumber: string;

  @ApiProperty({
    type: 'number',
    description: 'Employees bank account number',
  })
  bankId: number;

  @ApiProperty({
    type: 'number',
    description: 'Employees current bank account',
  })
  userBanksId: number;

  @ApiProperty({
    type: 'number',
    description: 'Employees current bank account',
  })
  addressId: number;

  @ApiProperty({
    type: 'number',
    description: 'Employees current bank account',
  })
  accountStatus: account_status_types;
}
