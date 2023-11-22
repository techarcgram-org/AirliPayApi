import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    description: 'Employees full name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees email',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees base salarry',
  })
  @IsNotEmpty()
  @IsNumber()
  baseSalary: number;

  @ApiProperty({
    type: 'string',
    description: 'Employees date of birth',
  })
  @IsNotEmpty()
  @IsString()
  dob: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees sex',
  })
  @IsNotEmpty()
  @IsString()
  sex: string;

  @ApiProperty({
    type: 'string',
    description: 'Picture of employee',
  })
  @IsNotEmpty()
  @IsString()
  photo: string;

  @ApiProperty({
    type: 'string',
    description: "Employee's client",
  })
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @ApiProperty({
    type: 'string',
    description: 'Employees city where he lives',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees street where he lives',
  })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees region where he lives',
  })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees primary phone',
  })
  @IsNotEmpty()
  @IsString()
  primaryPhone: string;

  @ApiProperty({
    type: 'string',
    description: 'Employees secondary phone',
  })
  @IsNotEmpty()
  @IsString()
  seconddaryPhone: string;
}
