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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
