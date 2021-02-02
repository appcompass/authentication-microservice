import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { AppServiceMock } from '../src/app.service.mock';

// TODO: Update to mock backend services, not app functionality.
describe('AppController (e2e)', () => {
  let app;
  process.env.npm_package_gitHead = 'test';
  process.env.npm_package_version = '0.0.0';

  beforeEach(async () => {
    const AppServiceProvider = {
      provide: AppService,
      useClass: AppServiceMock
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppServiceProvider]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/status (GET)', () =>
    request(app.getHttpServer()).get('/status').expect(200).expect({
      gitHash: 'testGitHash',
      serviceName: 'testServiceName',
      version: 'testVersion'
      // serviceName: 'authentication-microservice',
      // gitHash: 'test',
      // version: '0.0.0'
    }));
});
