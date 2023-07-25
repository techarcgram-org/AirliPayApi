import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { MailModule } from './core/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountSettingsModule } from './modules/account-settings/account-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailModule,
    UserModule,
    AuthModule,
    AccountSettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
