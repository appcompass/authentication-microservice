import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  @MessagePattern('auth.status') // TODO: figure out how to cleanly prefix all messages senging and listening.
  getServiceStatus() {
    return this.appService.getStatus();
  }
}
