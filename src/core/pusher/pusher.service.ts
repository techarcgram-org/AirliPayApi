import { Inject, Injectable, Logger } from '@nestjs/common';
import * as Pusher from 'pusher';

import { AppConfigService } from '../../config/config.service';

@Injectable()
export class PusherService {
  private pusher: Pusher = null;

  constructor(private appConfig: AppConfigService, private logger: Logger) {
    const { key, wsHost, secret, appId, useTLS, cluster } =
      this.appConfig.pusher;
    this.pusher = new Pusher({
      host: wsHost,
      appId: appId,
      key: key,
      secret: secret,
      useTLS: useTLS,
      cluster: cluster,
    });
  }
  async trigger(channel: string, event: string, data: any): Promise<void> {
    try {
      await this.pusher.trigger(channel, event, data);
    } catch (err) {
      this.logger.debug(err);
    }
  }
}
