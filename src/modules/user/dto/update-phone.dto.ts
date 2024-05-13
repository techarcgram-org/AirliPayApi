import { ApiProperty } from '@nestjs/swagger';

export class UpdatePhoneDto {
  @ApiProperty({
    type: 'boolean',
    description: 'Phone confirmation status',
  })
  phoneConfirmed: boolean;
}
