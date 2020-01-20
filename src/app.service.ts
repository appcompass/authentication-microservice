import { Injectable } from '@nestjs/common';

import { ConfigService } from './config/config.service';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getStatus() {
    return {
      serviceName: this.configService.get('npm_package_name'),
      gitHash: this.configService.get('npm_package_gitHead'),
      version: this.configService.get('npm_package_version')
    };
  }
}
