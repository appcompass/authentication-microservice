import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  @MessagePattern('authentication.status')
  getServiceStatus() {
    return this.appService.getStatus();
  }
}
