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
import { AppConfig, ConfigService } from './config/config.service';
import { MessagingConfigService } from './messaging/messaging.config';

Error.stackTraceLimit = Infinity;

async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
}

function applyValidators(app: NestExpressApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => new UnprocessableEntityException(errors, 'Validation Error')
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
}

async function addSwaggerDocs(app: NestExpressApplication, serviceName: string) {
  const options = new DocumentBuilder()
    .setTitle('AppCompass Authentication Service')
    .setDescription('A microservice for the AppCompass Web Application Platform')
    .setVersion('1.0')
    .addTag(serviceName)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  const redocOptions: RedocOptions = {
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false
  };

  await RedocModule.setup('/docs', app, document, redocOptions);
}

function applySecurity(app: NestExpressApplication, appConfig: AppConfig) {
  app.enableCors();

  app.use(helmet());
  app.use(rateLimit(appConfig.rateLimit));
}

async function startApp(app: NestExpressApplication, servicePort: number) {
  const messagingConfigService = app.get(MessagingConfigService);
  app.connectMicroservice(messagingConfigService.eventsConfig);

  await app.startAllMicroservicesAsync();
  await app.listen(servicePort);
}

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService);
  const serviceName = configService.get('npm_package_name');
  const appConfig = configService.get('appConfig');
  const servicePort = configService.get('servicePort');

  applyValidators(app);
  await addSwaggerDocs(app, serviceName);
  applySecurity(app, appConfig);

  await startApp(app, servicePort);
}

bootstrap();
