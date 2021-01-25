import { Injectable } from '@nestjs/common';
import { ClientOptions, Transport } from '@nestjs/microservices';

import { ConfigService } from '../config/config.service';

@Injectable()
export class MessagingConfigService {
  constructor(private readonly configService: ConfigService) {}

  get eventsConfig(): ClientOptions {
    return {
      transport: Transport.NATS,
      options: {
        url: this.configService.get('natsUrl'),
        queue: this.configService.get('natsQueue')
      }
    };
  }

  async getServiceUrl(name: string) {
    return await this.configService.vault.getServiceUrl(name);
  }
}
