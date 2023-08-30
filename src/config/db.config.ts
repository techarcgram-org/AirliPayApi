import { registerAs } from '@nestjs/config';

export interface DbConnectionConfig {
  url: string;
}

export default registerAs('db', () => ({
  url: process.env.DATABASE_URL,
}));
