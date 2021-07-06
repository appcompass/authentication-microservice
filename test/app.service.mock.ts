export class AppServiceMock {
  getStatus() {
    return {
      serviceName: 'testServiceName',
      gitHash: 'testGitHash',
      version: 'testVersion'
    };
  }
}
