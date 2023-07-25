import { Module } from '@nestjs/common';
import { AccountSettingsService } from './account-settings.service';
import { AccountSettingsController } from './account-settings.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { MailService } from 'src/core/mail/mail.service';

@Module({
  imports: [UserModule],
  controllers: [AccountSettingsController],
  providers: [AccountSettingsService, UserService, PrismaService, MailService],
})
export class AccountSettingsModule {}
