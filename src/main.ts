import { useContainer } from 'class-validator';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import { RedocModule, RedocOptions } from 'nestjs-redoc';

import {
  ClassSerializerInterceptor,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { MessagingConfigService } from './messaging/messaging.config';

Error.stackTraceLimit = Infinity;

async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
}

function applyValidators(app) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => new UnprocessableEntityException(errors, 'Validation Error')
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
}

async function addSwaggerDocs(app) {
  const options = new DocumentBuilder()
    .setTitle('AppCompass Authentication Service')
    .setDescription('A microservice for the AppCompass Web Application Platform')
    .setVersion('1.0')
    .addTag('Authentication')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  const redocOptions: RedocOptions = {
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false
  };

  await RedocModule.setup('/docs', app, document, redocOptions);
}

function applySecurity(app) {
  app.enableCors();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['"self"'],
          styleSrc: ['"self"', '"unsafe-inline"'],
          imgSrc: ['"self"', 'data:', 'validator.swagger.io'],
          scriptSrc: ['"self"', 'https: "unsafe-inline"']
        }
      }
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100
    })
  );
}

async function startApp(app) {
  const configService = app.get(ConfigService);
  const messagingConfigService = app.get(MessagingConfigService);

  app.connectMicroservice(messagingConfigService.eventsConfig);

  await app.startAllMicroservicesAsync();
  await app.listen(configService.get('servicePort'));
}

async function bootstrap() {
  const app = await createApp();

  applyValidators(app);
  await addSwaggerDocs(app);
  applySecurity(app);

  await startApp(app);
}

bootstrap();
