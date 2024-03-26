import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as multer from 'multer';

import { AppModule } from './app.module';
import 'src/common/lib/bingint';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/config.service';
import { TrimPipe } from './common/pipes/trim.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  // await app.listen(appConfig.app.servicePort || 3001);
  await app.listen(3001);
}
bootstrap();
