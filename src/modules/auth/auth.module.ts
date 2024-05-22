import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/modules/user/user.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AppConfigModule } from 'src/config/config.module';
import { AppConfigService } from 'src/config/config.service';
import { AccountSettingsService } from '../account-settings/account-settings.service';
import { AirlipayBalanceService } from '../airlipay-balance/airlipay-balance.service';
import { SavingsBalanceService } from '../savings-balance/savings-balance.service';
import { PaymentModule } from 'src/core/payment/payment.module';
import { PusherService } from 'src/core/pusher/pusher.service';
import { NotificationModule } from 'src/core/notification/notification.module';

@Module({
  providers: [
    AuthService,
    UserService,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    Logger,
    AccountSettingsService,
    AirlipayBalanceService,
    SavingsBalanceService,
    PusherService,
  ],
  imports: [
    AppConfigModule,
    PaymentModule,
    NotificationModule,
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (config: AppConfigService) => {
        return {
          secret: config.jwt.secret,
          signOptions: {
            expiresIn: config.jwt.expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
