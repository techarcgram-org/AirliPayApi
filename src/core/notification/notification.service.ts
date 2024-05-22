import { Injectable, Logger } from '@nestjs/common';
import { ExpoPushService } from './expoPush/expoPush.service';
import { NotificationType } from 'src/common/types/types..type';

@Injectable()
export class NotificationService {
  constructor(private expoPushService: ExpoPushService) {}

  sendNotification(messages: NotificationType[]) {
    this.expoPushService.sendNotification(messages);
  }
}
