import { registerAs } from '@nestjs/config';

export interface AppConfig {
  servicePort: number;
  env: string;
}

export default registerAs('app', () => ({
  servicePort: process.env.SERVICE_PORT,
  env: process.env.ENVIROMENT,
}));
