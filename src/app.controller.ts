import { Controller, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { AppService } from './app.service';
import { StatusResponse } from './app.status-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  @EventPattern('authentication.status')
  getServiceStatus(): StatusResponse {
    return this.appService.getStatus();
  }
}
