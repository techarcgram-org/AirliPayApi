import { registerAs } from '@nestjs/config';

export interface FapshiConfig {
  apiUrl: string;
  apiUser: string;
  apiKey: string;
}
export default registerAs('fapshi', () => ({
  apiUrl: process.env.FAPSHI_API_URL,
  apiUser: process.env.FAPSHI_API_USER,
  apiKey: process.env.FAPSHI_API_KEY,
}));
