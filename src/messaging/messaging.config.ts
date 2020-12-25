import { Injectable } from '@nestjs/common';
import { ClientOptions, Transport } from '@nestjs/microservices';

import { ConfigService } from '../config/config.service';

@Injectable()
export class MessagingConfigService {
  constructor(private readonly configService: ConfigService) {}

  get config(): ClientOptions {
    return {
      transport: Transport.NATS,
      options: {
        url: this.configService.get('NATS_URL'),
        queue: 'authentication'
      }
    };
  }
}
