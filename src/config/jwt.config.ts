import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key', // replace with your secret key
  expiresIn: process.env.JWT_EXPIRES_IN || '1d', // replace with token expiration time
}));
