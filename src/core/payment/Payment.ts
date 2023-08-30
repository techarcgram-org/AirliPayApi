import {
  PaymentStatus,
  PaymentType,
  TelecomOperator,
} from '../../common/constants';

export interface MtnPayment {
  amount: number;
  currency: string;
  financialTransactionId: string;
  externalId: string;
  payer?: {
    partyIdType: string;
    partyId: string;
  };
  status: string;
}

export interface OrangePayment {
  createtime: number;
  amount: number;
  channelUserMsisdn: string;
  inittxnmessage: string;
  confirmtxnmessage: string;
  confirmtxnstatus: string;
  subscriberMsisdn: string;
  txnmode: string;
  notifyUrl: string;
  inittxnstatus: string;
  payToken: string;
  txnid: string;
  status: string;
  accessToken: string;
}

export interface Payment {
  type: PaymentType;
  operator: TelecomOperator;
  mtn?: MtnPayment;
  orange?: OrangePayment;
  status: PaymentStatus;
}
