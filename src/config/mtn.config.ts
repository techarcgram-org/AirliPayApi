import { registerAs } from '@nestjs/config';

export interface MtnConfig {
  targetEnvironment: string;
  collectionSubscriptionKey: string;
  disbursementSubscriptionKey: string;
  baseUrl: string;
  userIdCollection: string;
  apiKeyCollection: string;
  userIdDisbursement: string;
  apiKeyDisbursement: string;
  callbackUrl: string;
  currency: string;
}
export default registerAs('mtn', () => ({
  targetEnvironment: process.env.MTN_TARGET_ENVIRONMENT,
  collectionSubscriptionKey: process.env.MTN_COLLECTION_SUBSCRIPTION_KEY,
  disbursementSubscriptionKey: process.env.MTN_DISBURSEMENT_SUBSCRIPTION_KEY,
  userIdCollection: process.env.MTN_USER_ID_COLLECTION,
  apiKeyCollection: process.env.MTN_API_KEY_COLLECTION,
  userIdDisbursement: process.env.MTN_USER_ID_DISBURSEMENT,
  apiKeyDisbursement: process.env.MTN_API_KEY_DISBURSEMENT,
  callbackUrl: process.env.MTN_CALLBACK_URL,
  baseUrl: process.env.MTN_BASE_URL,
  currency: process.env.MTN_CURRENCY,
}));
