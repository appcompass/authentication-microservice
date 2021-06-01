import { Injectable } from '@nestjs/common';
import { ClientOptions } from '@nestjs/microservices';

import { ConfigService } from '../config/config.service';

@Injectable()
export class MessagingConfigService {
  constructor(private readonly configService: ConfigService) {}

  get eventsConfig(): ClientOptions {
    return this.configService.get('interServiceTransportConfig');
  }

  async getServiceUrl(name: string) {
    return await this.configService.vault.getServiceUrl(name);
  }
}
