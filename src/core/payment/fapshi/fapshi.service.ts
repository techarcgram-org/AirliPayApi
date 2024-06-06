import { AppConfigService } from '../../../config/config.service';
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FapshiService {
  headers;
  apiUrl;
  constructor(private appConfig: AppConfigService, private logger: Logger) {
    const { apiUser, apiKey, apiUrl } = this.appConfig.fapshi;
    this.apiUrl = apiUrl;
    this.headers = {
      'Content-Type': 'application/json',
      apiuser: apiUser,
      apikey: apiKey,
    };
  }

  async initiatePayout(
    phone: string,
    amount: number,
    medium?: string,
    name?: string,
    email?: string,
    userId?: string,
  ) {
    const data = {
      amount,
      phone,
      medium,
      name,
      email,
      userId,
    };
    try {
      const response: AxiosResponse = await axios.post(
        `${this.apiUrl}/payout`,
        data,
        { headers: this.headers },
      );
      console.log('payout initiated successfully:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`Error making payout ${error}`);
      throw new HttpException(
        `Failed making payout: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async paymentStatus(transactionId: string) {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.apiUrl}/payment-status/${transactionId}`,
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error getting transactions status ${error}`);
      throw new HttpException(
        `Error getting transactions status: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
