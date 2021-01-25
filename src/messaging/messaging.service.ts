import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { from } from 'rxjs';

import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';

import { MessagingConfigService } from './messaging.config';

@Injectable()
export class MessagingService {
  private eventsClient: ClientProxy;
  private reqClient: AxiosInstance;
  private urls: Record<string, string> = {};
  constructor(private readonly configService: MessagingConfigService) {
    this.eventsClient = ClientProxyFactory.create(this.configService.eventsConfig);
    this.reqClient = axios.create();
    this.reqClient.defaults.headers.common['X-API-KEY'] = 'foo';
  }

  send<R, I>(pattern: string, data: I) {
    return from(this.sendAsync<R, I>(pattern, data));
  }

  async sendAsync<R, I>(pattern: string, payload: I) {
    const url = await this.getUrl(pattern);
    const { data } = await this.reqClient.post<I, AxiosResponse<R>>(url, payload);
    return data;
  }

  emit<R, I>(pattern: string, data: I) {
    return this.eventsClient.emit<R, I>(pattern, data);
  }

  emitAsync<R, I>(pattern: string, data: I) {
    return this.eventsClient.emit<R, I>(pattern, data).toPromise();
  }

  private async getUrl(pattern: string) {
    const serviceName = pattern.substr(0, pattern.indexOf('.'));
    const url =
      this.urls[serviceName] ?? (this.urls[serviceName] = await this.configService.getServiceUrl(serviceName));
    return `${url}/${pattern}`;
  }
}
