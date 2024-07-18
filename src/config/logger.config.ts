import * as winston from 'winston';

const loggerConfig = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: './logs/app.log' }),
    new winston.transports.Console({
      level: process.env?.APP_ENV?.indexOf('prod') === 0 ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf((msg) => {
          let extra = undefined;
          if (msg.stack && msg.stack.length > 0) {
            extra = msg.stack[0];
          }
          return `${msg.timestamp} [${msg.level}] - ${msg.message} ${
            extra ? JSON.stringify(extra) : ''
          }`;
        }),
      ),
    }),
  ],
});

export { loggerConfig };
