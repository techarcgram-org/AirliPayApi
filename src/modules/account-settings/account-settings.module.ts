import { Logger, Module } from '@nestjs/common';
import { AccountSettingsService } from './account-settings.service';
import { AccountSettingsController } from './account-settings.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { AppConfigModule } from 'src/config/config.module';

@Module({
  imports: [UserModule, AppConfigModule],
  controllers: [AccountSettingsController],
  providers: [AccountSettingsService, UserService, PrismaService, Logger],
})
export class AccountSettingsModule {}
