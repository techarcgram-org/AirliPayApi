import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({
    type: 'string',
    description: 'employees email',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    type: 'string',
    description: 'employees login password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    type: 'string',
    description: 'remember me bolean',
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  remember: boolean;
}
