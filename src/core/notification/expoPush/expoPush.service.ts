import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Scope,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { NotificationType } from 'src/common/types/types..type';

@Injectable()
export class ExpoPushService {
  constructor(private logger: Logger) {}
  private readonly expoUrl = 'https://exp.host/--';

  async sendNotification(messages: NotificationType[]) {
    const headers = {
      'Content-Type': 'application/json',
      // 'expo-push-token': process.env.EXPO_PUSH_TOKEN,
    };
    try {
      const response: AxiosResponse = await axios.post(
        `${this.expoUrl}/api/v2/push/send`,
        messages,
        { headers },
      );
      console.log('Push notification sent successfully:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`error ${error}`);
      throw new HttpException(
        `Failed sending notification: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNotificationStatus(device_ids: string[]) {
    const headers = {
      'Content-Type': 'application/json',
      // 'expo-push-token': process.env.EXPO_PUSH_TOKEN,
    };

    try {
      const response: AxiosResponse = await axios.post(
        `${this.expoUrl}/api/v2/push/getReceipts`,
        device_ids,
        { headers },
      );
    } catch (error) {
      this.logger.error(`error ${error}`);
      throw new HttpException(
        `Failed getting notification: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
