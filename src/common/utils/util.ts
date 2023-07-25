import { TelecomOperator } from '../constants';

export const telecomOperator = (phoneNumber: string): TelecomOperator => {
  const key = phoneNumber[4];
  if (key === '7' || key === '8') {
    return TelecomOperator.MTN;
  }
  if (key === '9') {
    return TelecomOperator.ORANGE;
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
  return regex.test(phoneNumber);
};
