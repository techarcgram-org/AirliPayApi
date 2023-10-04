import { registerAs } from '@nestjs/config';

export interface PusherConfig {
  key: string;
  appId: string;
  wsHost: string;
  secret: string;
  useTLS: boolean;
  cluster: string;
}

export default registerAs('pusher', () => ({
  key: process.env.PUSHER_KEY,
  wsHost: process.env.PUSHER_WS_HOST,
  appId: process.env.PUSHER_APP_ID,
  secret: process.env.PUSHER_APP_SECRET,
  useTLS: process.env.PUSHER_USE_TLS === 'true',
  cluster: process.env.PUSHER_CLUSTER,
}));
