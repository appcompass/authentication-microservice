import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppServiceMock } from './app.service.mock';

const getAppController = async () => {
  const AppServiceProvider = {
    provide: AppService,
    useClass: AppServiceMock
  };
  const app: TestingModule = await Test.createTestingModule({
    controllers: [AppController],
    providers: [AppServiceProvider]
  }).compile();

  return app.get<AppController>(AppController);
};

describe('AppController', () => {
  describe('status', () => {
    it('should return proper status response', async () => {
      const appController = await getAppController();

      expect(appController.getServiceStatus()).toEqual({
        gitHash: 'testGitHash',
        serviceName: 'testServiceName',
        version: 'testVersion'
      });
    });
  });
});
