import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserByEmployeeIdDto {
  @ApiProperty({
    type: 'string',
    description: 'employers given employee id',
  })
  @IsNotEmpty()
  @IsString()
  employeeId: string;
}
