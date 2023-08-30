import { registerAs } from '@nestjs/config';

export interface MailerConfig {
  service: string;
  user: string;
  password: string;
  from: string;
}

export default registerAs('mailer', () => ({
  service: process.env.MAIL_SERVICE,
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  from: process.env.MAIL_FROM,
}));
