import { firstValueFrom } from 'rxjs';

import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';

import { MessagingConfigService } from './messaging.config';

@Injectable()
export class MessagingService implements OnApplicationShutdown, OnApplicationBootstrap {
  private eventsClient: ClientProxy;
  constructor(private readonly configService: MessagingConfigService) {
    this.eventsClient = ClientProxyFactory.create(this.configService.eventsConfig);
  }

  send<R, I = unknown>(pattern: string, data: I) {
    return this.eventsClient.send<R, I>(pattern, data);
  }

  async sendAsync<R, I = unknown>(pattern: string, data: I) {
    return await firstValueFrom(this.send<R, I>(pattern, data));
  }

  emit<R, I = unknown>(pattern: string, data: I) {
    return this.eventsClient.emit<R, I>(pattern, data);
  }

  async emitAsync<R, I = unknown>(pattern: string, data: I) {
    return await firstValueFrom(this.emit<R, I>(pattern, data));
  }

  async onApplicationBootstrap() {
    await this.eventsClient.connect();
  }

  async onApplicationShutdown() {
    await this.eventsClient.close();
  }
}
