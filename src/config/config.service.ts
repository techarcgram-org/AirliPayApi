import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerConfig } from './mailer.config';
import { DbConnectionConfig } from './db.config';
import { JWTConfig } from './jwt.config';
import { AppConfig } from './app.config';
import { MtnConfig } from './mtn.config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get app(): AppConfig {
    const env = this.configService.get<string>('app.env');
    const servicePort = this.configService.get<number>('app.servicePort');
    return {
      env,
      servicePort,
    };
  }

  get db(): DbConnectionConfig {
    const url = this.configService.get<string>('db.url');
    return {
      url,
    };
  }

  get mtn(): MtnConfig {
    const targetEnvironment = this.configService.get<string>(
      'mtn.targetEnvironment',
    );
    const collectionSubscriptionKey = this.configService.get<string>(
      'mtn.collectionSubscriptionKey',
    );
    const disbursementSubscriptionKey = this.configService.get<string>(
      'mtn.disbursementSubscriptionKey',
    );
    const apiKeyCollection = this.configService.get<string>(
      'mtn.apiKeyCollection',
    );
    const userIdCollection = this.configService.get<string>(
      'mtn.userIdCollection',
    );
    const apiKeyDisbursement = this.configService.get<string>(
      'mtn.apiKeyDisbursement',
    );
    const userIdDisbursement = this.configService.get<string>(
      'mtn.userIdDisbursement',
    );
    const baseUrl = this.configService.get<string>('mtn.baseUrl');
    const callbackUrl = this.configService.get<string>('mtn.callbackUrl');
    const currency = this.configService.get<string>('mtn.currency');

    return {
      targetEnvironment,
      baseUrl,
      collectionSubscriptionKey,
      disbursementSubscriptionKey,
      apiKeyCollection,
      userIdCollection,
      apiKeyDisbursement,
      userIdDisbursement,
      callbackUrl,
      currency,
    };
  }

  get jwt(): JWTConfig {
    const secret = this.configService.get<string>('jwt.secret');
    const expiresIn = this.configService.get<string>('jwt.expiresIn');
    return {
      secret,
      expiresIn,
    };
  }

  get mailer(): MailerConfig {
    const service = this.configService.get<string>('mailer.service');
    const user = this.configService.get<string>('mailer.user');
    const password = this.configService.get<string>('mailer.password');
    const from = this.configService.get<string>('mailer.from');
    return {
      service,
      user,
      password,
      from,
    };
  }
}
