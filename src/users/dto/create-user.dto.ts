import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    description: 'employers given employee id',
  })
  @IsNotEmpty()
  @IsString()
  employee_id: string;
}
