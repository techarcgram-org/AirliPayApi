import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { MailModule } from './core/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountSettingsModule } from './modules/account-settings/account-settings.module';
import { AirlipayBalanceModule } from './modules/airlipay-balance/airlipay-balance.module';
import { SavingsBalanceModule } from './modules/savings-balance/savings-balance.module';
import { AppConfigModule } from './config/config.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PusherModule } from './core/pusher/pusher.module';
import { AccessControlModule } from 'nest-access-control';
import { RBAC_POLICY } from './modules/auth/rbac-policy';
import { ClientModule } from './modules/client/client.module';
import { AdminModule } from './modules/admin/admin.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
@Module({
  imports: [
    AppConfigModule,
    MailModule,
    UserModule,
    AuthModule,
    AccountSettingsModule,
    AirlipayBalanceModule,
    SavingsBalanceModule,
    PusherModule,
    ScheduleModule.forRoot(),
    AccessControlModule.forRoles(RBAC_POLICY),
    ClientModule,
    AdminModule,
    InvoiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
