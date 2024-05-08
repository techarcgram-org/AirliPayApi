import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BuldCreateUserDto {
  @ApiProperty({
    type: 'number',
    description: "Employee's employer id",
  })
  @IsNotEmpty()
  clientId: number;
}
