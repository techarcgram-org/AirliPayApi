import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    description: 'Employees full name',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees email',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees base salarry',
  })
  @IsNotEmpty()
  baseSalary: number;

  @ApiProperty({
    type: 'string',
    description: 'Employees date of birth',
  })
  @IsNotEmpty()
  dob: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees sex',
  })
  @IsNotEmpty()
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
  @IsNotEmpty()
  clientId: number;

  @ApiProperty({
    type: 'string',
    description: 'Employees city where he lives',
  })
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees street where he lives',
  })
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees region where he lives',
  })
  @IsNotEmpty()
  region: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees primary phone',
  })
  @IsNotEmpty()
  primaryPhone: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees secondary phone',
  })
  secondaryPhone: string;
}
