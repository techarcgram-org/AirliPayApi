import { TelecomOperator, TestNumbers } from '../constants';
import * as currency from 'currency.js';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as streamToPromise from 'stream-to-promise';

const SALT_ROUNDS = 12;

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

export function generatePasswordHash(password: string): string {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export const csvFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(new Error('Only CSV files are allowed!'), false);
  }
  callback(null, true);
};

// export const csvFileName = (req, file, callback) => {
//   //const name = file.originalname.split('.')[0];
//   const fileExtName = extname(file.originalname);
//   callback(null, `data${fileExtName}`);
// };

export const csvFileName = (req, file, callback) => {
  const clientName = (req.body && req.body.name) || 'default';
  file.originalname = clientName;
  const filename = file.originalname.split('.')[0];
  const randomName = moment().format();
  callback(null, `${filename}-${randomName}${extname(file.originalname)}`);
};

export const csvDestination = (req, file, callback) => {
  const name = (req.body && req.body.name) || 'csv-client';
  const folderName = './uploads/' + name;
  callback(null, folderName);
};

export const getCSVFile = () => {
  //const name = file.originalname.split('.')[0];
  const filePath = join(__dirname, '..', '..', 'uploads/csv', 'data.csv');
  return filePath;
};

export const constructUsersArrayFromCsv = async (csvFile) => {
  const readStream = fs.createReadStream(csvFile.path);
  const users = [];
  try {
    await streamToPromise(
      readStream
        .pipe(csv())
        .on('data', (row) => {
          users.push(row);
        })
        .on('end', () => {
          console.log('CSV file processing completed.');
        }),
    );
    return users;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
