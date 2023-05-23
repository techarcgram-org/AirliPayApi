import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    type: 'string',
    description: 'Email reset password',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'New reset password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
