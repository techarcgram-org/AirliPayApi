import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendConfirmEmailDto {
  @ApiProperty({
    type: 'string',
    description: 'employers given email',
  })
  @IsNotEmpty()
  @IsString()
  email: string;
}
