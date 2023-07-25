import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNewPasswordDto {
  @ApiProperty({
    type: 'string',
    description: 'password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    type: 'string',
    description: 'confirm password',
  })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
