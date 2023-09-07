import { TelecomOperator, TestNumbers } from '../constants';
import * as currency from 'currency.js';

export const telecomOperator = (phoneNumber: string): TelecomOperator => {
  const key = phoneNumber[4];
  if (key === '7' || key === '8') {
    return TelecomOperator.MTN;
  }
  if (key === '9') {
    return TelecomOperator.ORANGE;
  }
  if (phoneNumber.indexOf('46733') === 0) {
    return TelecomOperator.MTN;
  }
  if (phoneNumber.indexOf('23765') < 0) {
    return TelecomOperator.UNKNOWN;
  }
  const subKey = phoneNumber[5];
  if (subKey >= '0' && subKey < '5') {
    return TelecomOperator.MTN;
  }
  if (subKey >= '5' && subKey <= '9') {
    return TelecomOperator.ORANGE;
  }
  return TelecomOperator.UNKNOWN;
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const regex = new RegExp('^2376[5-9]{1}\\d{7}$');
  return (
    regex.test(phoneNumber) ||
    !!TestNumbers.find((number) => number === phoneNumber)
  );
};

export const logPrefix = () => {
  const e = new Error();
  const frame = e.stack.split('\n')[2];
  const lineNumber = frame.split(':').reverse()[1];
  const functionName = frame.split(' ')[5];
  return `[${functionName}:${lineNumber}]`;
};

export const toAirliPayMoney = (amt: number) => {
  return currency(amt, { precision: 2 }).value;
};

export const delay = (value: number) => {
  return null;
};

export const addAToB = (a: number, b: number): number => {
  const additionObj = currency(a, { precision: 2 }).add(b).value;
  return additionObj;
};

export const subtractBFromA = (a: number, b: number): number => {
  const subtractionObj = currency(a, { precision: 2 }).subtract(b).value;
  return subtractionObj;
};

export const formatPhonenumber = (phoneNumber: string) => {
  let number;
  let result;
  if (phoneNumber.split('467')) {
    number = phoneNumber.split('467');
    result = number[1].match(/.{1,3}/g) ?? [];
    return `(test) ${result[0]} ${result[1]} ${result[2]}`;
  }
  number = phoneNumber.split('237');
  result = number[1].match(/.{1,3}/g) ?? [];
  return `(+237) ${result[0]} ${result[1]} ${result[2]}`;
};
