import { registerAs } from '@nestjs/config';

export interface ExpoConfig {
  accessToken: string;
}

export default registerAs('expoconfig', () => ({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
}));
