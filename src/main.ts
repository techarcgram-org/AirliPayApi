import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as multer from 'multer';

import { AppModule } from './app.module';
import 'src/common/lib/bingint';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppConfigService } from './config/config.service';
import { TrimPipe } from './common/pipes/trim.pipe';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: WinstonModule.createLogger({
      instance: loggerConfig,
    }),
  });
  const appConfig: AppConfigService = app.get(AppConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
    // new TrimPipe(),
  );
  const config = new DocumentBuilder()
    .setTitle('AirliPay Swagger')
    .setDescription('AirliPay Api Docs')
    .setVersion('1.0')
    .build();
  const logger = app.get(Logger);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  });
  await app.listen(appConfig.app.servicePort || 8004, () => {
    logger.log('[🚀 ] - Serving API docs using ' + '/api');

    logger.log(
      `🚀 ====> Application running on port: ${
        appConfig.app.servicePort || 8004
      }`,
    );
  });
  // await app.listen(3000);
}
bootstrap();
