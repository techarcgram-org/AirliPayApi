import { Logger, Module } from '@nestjs/common';
import { ExpoPushService } from './expoPush/expoPush.service';
import { NotificationService } from './notification.service';

@Module({
  imports: [],
  providers: [ExpoPushService, Logger],
  exports: [NotificationService],
})
export class NotificationModule {}
