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
  EXECUTED_WITH_STATUS_PENDING = 'EXECUTED WITH STATUS PENDING',
  CRITICAL_ERROR = 'CRITICAL_ERROR',
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
  BLOCKEDBANNED = 'BLOCKEDBANNED',
}

export const TestNumbers = [
  '46733123450',
  '46733123451',
  '46733123452',
  '46733123453',
  '46733123454',
];
