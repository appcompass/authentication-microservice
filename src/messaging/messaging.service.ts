import { ConfigService } from 'src/config/config.service';

import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport
} from '@nestjs/microservices';

@Injectable()
export class MessagingService {
  private client: ClientProxy;
  constructor(private readonly configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: this.configService.get('REDIS_URL')
      }
    });
  }

  send<R, I>(pattern: string, data: I) {
    return this.client.send<R, I>(pattern, data);
  }

  sendAsync<R, I>(pattern: string, data: I) {
    return this.client.send<R, I>(pattern, data).toPromise();
  }

  emit<R, I>(pattern: string, data: I) {
    return this.client.emit<R, I>(pattern, data);
  }

  emitAsync<R, I>(pattern: string, data: I) {
    return this.client.emit<R, I>(pattern, data).toPromise();
  }
}
