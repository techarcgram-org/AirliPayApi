import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../config/config.service';
import { v4 as uuid } from 'uuid';
import { PaymentStatus, PaymentType } from '../../../common/constants';
import axios from 'axios';
import { MtnConfig } from '../../../config/mtn.config';
import { MtnPayment } from '../Payment';
import { logPrefix } from '../../../common/utils/util';
// import * as Sentry from '@sentry/node';

@Injectable()
export class MtnService {
  headers;
  constructor(private appConfig: AppConfigService, private logger: Logger) {
    const { targetEnvironment } = this.appConfig.mtn;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Target-Environment': targetEnvironment,
    };
  }

  async initTransaction(
    type: PaymentType,
    phoneNumber: string,
    amount: number,
    externalId: string,
    note: string,
    message: string,
  ): Promise<MtnPayment> {
    const { baseUrl, currency, targetEnvironment } = this.appConfig.mtn;
    const transactionId = uuid();
    const accessToken = await getAccessToken(
      this.appConfig.mtn,
      this.headers,
      type,
    );
    if (!accessToken) {
      throw new Error('invalid access token');
    }

    let path;
    switch (type) {
      case PaymentType.REQUEST:
        path = `collection/v1_0/requesttopay`;
        break;
      case PaymentType.DEPOSIT:
        path = `disbursement/v1_0/transfer`;
        break;
      default:
        throw new Error('invalid payment transaction type');
    }

    const subscriptionKey = this.getSubscriptionKey(type);
    const data: any = {
      amount: amount.toString(),
      currency: currency,
      externalId: externalId,
      payerMessage: message,
      payeeNote: note,
    };
    if (type === PaymentType.DEPOSIT) {
      data.payee = { partyIdType: 'MSISDN', partyId: phoneNumber };
    } else {
      data.payer = { partyIdType: 'MSISDN', partyId: phoneNumber };
    }

    try {
      console.log(data);
      const res = await axios.post(`${baseUrl}/${path}`, data, {
        headers: {
          'X-Reference-Id': transactionId,
          'X-Target-Environment': targetEnvironment,
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.status === HttpStatus.ACCEPTED) {
        return <MtnPayment>{
          financialTransactionId: transactionId,
          status: PaymentStatus.PENDING,
        };
      } else {
        throw new HttpException(
          `an error occurred: status: ${res.status}, data: ${JSON.stringify(
            res.data,
          )}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (e) {
      this.logger.error(`${logPrefix()} ${e?.message}`);
      throw new HttpException(
        e.response.data,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAccountBalance() {
    const { baseUrl, targetEnvironment } = this.appConfig.mtn;
    const subscriptionKey = this.getSubscriptionKey(PaymentType.REQUEST);
    console.log('SUB KEY', subscriptionKey);
    let accessToken: any;
    try {
      accessToken = await getAccessToken(
        this.appConfig.mtn,
        this.headers,
        PaymentType.REQUEST,
      );
    } catch (e) {
      this.logger.error(`${logPrefix()} Error getting access token: ${e}`);
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const res = await axios.get(
        `${baseUrl}/collection/v1_0/account/balance`,
        {
          headers: {
            'X-Target-Environment': targetEnvironment,
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res.data;
    } catch (e) {
      this.logger.error(`${logPrefix()} Error getting account balance: ${e}`);
      throw new HttpException(
        `Error getting account balance: ${e}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getSubscriptionKey(type: PaymentType) {
    const { collectionSubscriptionKey, disbursementSubscriptionKey } =
      this.appConfig.mtn;

    let subscriptionKey = collectionSubscriptionKey;
    if (type === PaymentType.DEPOSIT) {
      subscriptionKey = disbursementSubscriptionKey;
    }
    return subscriptionKey;
  }

  async paymentStatus(type, referenceId): Promise<MtnPayment> {
    const { baseUrl } = this.appConfig.mtn;
    const accessToken = await getAccessToken(
      this.appConfig.mtn,
      this.headers,
      type,
    );
    if (!accessToken) {
      throw new Error('invalid access token');
    }
    let path;
    switch (type) {
      case PaymentType.REQUEST:
        path = `${baseUrl}/collection/v1_0/requesttopay/${referenceId}`;
        break;
      case PaymentType.DEPOSIT:
        path = `${baseUrl}/disbursement/v1_0/transfer/${referenceId}`;
        break;
      default:
        throw new Error('invalid transaction type');
    }

    try {
      const res = await axios.get(path, {
        headers: {
          ...this.headers,
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': this.getSubscriptionKey(type),
        },
      });
      if (res.status === HttpStatus.OK) {
        return res.data as MtnPayment;
      } else {
        throw new Error(
          `an error occured: status: ${res.status}, data: ${JSON.stringify(
            res.data,
          )}`,
        );
      }
    } catch (e) {
      this.logger.error(`${logPrefix()} ${e?.message}`);
      throw new HttpException(
        e.response.data,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async mtnHealthCheck(type: PaymentType) {
    const token = await getAccessToken(this.appConfig.mtn, this.headers, type);
    if (!token) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.OK;
  }
}

const getAccessToken = async (
  config: MtnConfig,
  headers: any,
  paymentType: PaymentType,
): Promise<string> => {
  const {
    baseUrl,
    userIdCollection,
    apiKeyCollection,
    userIdDisbursement,
    apiKeyDisbursement,
    collectionSubscriptionKey,
    disbursementSubscriptionKey,
  } = config;
  const path = `${baseUrl}/${
    paymentType == PaymentType.REQUEST ? 'collection' : 'disbursement'
  }/token/`;

  let subscriptionKey = collectionSubscriptionKey;
  if (paymentType === PaymentType.DEPOSIT) {
    subscriptionKey = disbursementSubscriptionKey;
  }

  let authorization: any = null;
  authorization = Buffer.from(
    `${userIdCollection}:${apiKeyCollection}`,
  ).toString('base64');

  if (paymentType === PaymentType.DEPOSIT) {
    authorization = Buffer.from(
      `${userIdDisbursement}:${apiKeyDisbursement}`,
    ).toString('base64');
  }
  try {
    const res = await axios.post(
      path,
      {},
      {
        headers: {
          ...headers,
          Authorization: `Basic ${authorization}`,
          'Ocp-Apim-Subscription-Key': subscriptionKey,
        },
      },
    );
    if (res.status === HttpStatus.OK) {
      return res.data?.access_token || '';
    } else {
      throw new Error(
        `an error occurred: status: ${res.status}, data: ${JSON.stringify(
          res.data,
        )}`,
      );
    }
  } catch (e) {
    throw new Error(
      `an error occurred while getting access token: ${e?.message}`,
    );
  }
};
