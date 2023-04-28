import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserByEmailDto {
  @ApiProperty({
    type: 'string',
    description: 'employers email',
  })
  @IsNotEmpty()
  @IsString()
  employeeEmail: string;
}
