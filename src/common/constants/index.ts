export enum TelecomOperator {
  MTN = 'MTN',
  ORANGE = 'ORANGE',
  UNKNOWN = 'UNKNOWN',
}

export enum PaymentType {
  REQUEST = 'REQUEST',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  EXECUTED = 'EXECUTED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
  EXPIRED = 'EXPIRED',
  EXECUTED_WITH_STATUS_PENDING = 'EXECUTED WITH STATUS PENDING',
  CRITICAL_ERROR = 'CRITICAL_ERROR',
  CREATED = 'CREATED',
}

export enum PaymentProvider {
  MTN = 'MTN',
  ORANGE = 'ORANGE',
  INTERNALTRANSFER = 'INTERNALTRANSFER',
  INTERNAL = 'INTERNAL',
  ADMIN = 'ADMIN',
  TRANSFER = 'TRANSFER',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'MOMOWITHDRAW',
  INTERESTWITHDRAW = 'INTERESTWITHDRAW',
  WITHDRAWAL = 'WITHDRAW',
  AUTO_INTERNAL_TRANSFER_FROM_GOAL = 'AUTO_INTERNALTRANSFERFROMGOAL',
}

export enum AccountStatus {
  DEACTIVATED = 'DEACTIVATED',
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
  BANNED = 'BANNED',
}

export enum InvoiceStatus {
  TREATED = 'TREATED',
  NOT_TREATED = 'NOT_TREATED',
}

export const TestNumbers = [
  '46733123450',
  '46733123451',
  '46733123452',
  '46733123453',
  '46733123454',
];

export enum PusherEvents {
  EARLYPAY_TOPUP_SUCCESS = 'EARLYPAY_TOPUP_SUCCESS',
}

export enum PusherChannels {
  PAYMENT_SUCCESS = 'payment-success',
  PAYMENT_FAILED = 'payment-failed',
  NOTIFICATION = 'notification',
  CHAT = 'chat',
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}
