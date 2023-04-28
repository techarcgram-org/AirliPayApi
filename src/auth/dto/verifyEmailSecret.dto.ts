import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailSecretDto {
  @ApiProperty({
    type: 'string',
    description: 'employee/user email',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'email verification secret',
  })
  @IsNotEmpty()
  @IsString()
  secret: string;
}
