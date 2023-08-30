import { PartialType } from '@nestjs/swagger';
import { CreateSavingsBalanceDto } from './create-savings-balance.dto';

export class UpdateSavingsBalanceDto extends PartialType(CreateSavingsBalanceDto) {}
