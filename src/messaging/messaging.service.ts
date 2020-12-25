import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';

import { MessagingConfigService } from './messaging.config';

@Injectable()
export class MessagingService {
  private client: ClientProxy;
  constructor(private readonly configService: MessagingConfigService) {
    this.client = ClientProxyFactory.create(this.configService.config);
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
