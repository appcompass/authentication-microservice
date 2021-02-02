import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app;
  process.env.npm_package_gitHead = 'test';
  process.env.npm_package_version = '0.0.0';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/status (GET)', () =>
    request(app.getHttpServer()).get('/status').expect(200).expect({
      serviceName: 'authentication-microservice',
      gitHash: 'test',
      version: '0.0.0'
    }));
});
