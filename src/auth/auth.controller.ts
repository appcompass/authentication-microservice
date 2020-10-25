import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';

import { AuthConfigService } from './auth-config.service';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly authConfigService: AuthConfigService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @UseGuards(AuthGuard())
  @Get('logout')
  async logout(@Request() req) {
    return await this.authService.logout(req.user);
  }

  @EventPattern('authentication.public-key')
  sendPublicKey() {
    return this.authConfigService.publicKey.toString();
  }
}
