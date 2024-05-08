import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordVerifyDto {
  @ApiProperty({
    type: 'string',
    description: 'employers given email',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'Reset password string',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
