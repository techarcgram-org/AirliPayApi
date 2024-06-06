import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppConfigService } from './config.service';
import dbConfig from './db.config';
import jwtConfig from './jwt.config';
import mailerConfig from './mailer.config';

import expoConfig from './expo.config';
import mtnConfig from './mtn.config';
import fapshiConfig from './fapshi.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        dbConfig,
        jwtConfig,
        mailerConfig,
        expoConfig,
        mtnConfig,
        fapshiConfig,
      ],
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
