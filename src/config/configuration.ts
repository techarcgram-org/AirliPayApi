import * as dotenv from 'dotenv';

dotenv.config();

export default () => ({
  DATABASE_URL: process.env.DB_CONNECTION_STRING,
  HONEY_BADGER_API_KEY: process.env.HONEY_BADGER_API_KEY,
  TYPEORM_SEEDING_FACTORIES: process.env.TYPEORM_SEEDING_FACTORIES,
  TYPEORM_SEEDING_SEEDS: process.env.TYPEORM_SEEDING_SEEDS,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

  companyEmail: process.env.COMPANY_EMAIL, // 📧

  // elasticsearch: {
  //   node: process.env.ELASTIC_SEARCH_NODE,
  //   username: process.env.ELASTIC_SEARCH_USERNAME,
  //   password: process.env.ELASTIC_SEARCH_PASSWORD,
  // },
  // throttler: {
  //   ttl: +process.env.THROTTLER_TIME_RANGE,
  //   limit: +process.env.THROTTLER_REQUEST_LIMIT,
  // },
  // kafka: {
  //   broker: process.env.KAFKA_BROKER,
  //   username: process.env.KAFKA_USERNAME,
  //   password: process.env.KAFKA_PASSWORD,
  //   consumer_group: 'main_service',
  // },
  // userInvite: {
  //   schedulerInterval: process.env.SCHEDULER_INTERVAL, // ⏰
  //   userInviteRetry: process.env.USER_INVITE_RETRY_INTERVAL, // 👨‍⚕ ⏰
  //   userInviteExpire: process.env.USER_INVITE_EXPIRES_IN, // ⏰
  //   userInviteBaseUrl: process.env.USER,
  // },
});
