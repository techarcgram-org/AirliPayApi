import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { AirlipayBalanceModule } from '../airlipay-balance/airlipay-balance.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({})
export class CronjobsModule {
  static register(): DynamicModule {
    const imports: (
      | DynamicModule
      | Type<any>
      | Promise<DynamicModule>
      | ForwardReference<any>
    )[] = [];
    const providers = [];
    if (process.env.JOB_ENABLE === 'true') {
      imports.push(AirlipayBalanceModule, InvoiceModule);
      providers.push(CronjobsService);
    } else {
      providers.push({
        provide: CronjobsService,
        useValue: {},
      });
    }
    return {
      module: CronjobsModule,
      providers,
      exports: [],
      imports,
    };
  }
}
