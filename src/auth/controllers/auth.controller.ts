import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';

import { AuthConfigService } from '../auth-config.service';
import { AuthenticatedUser } from '../auth.types';
import { AuthService } from '../services/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly authConfigService: AuthConfigService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    const user = req.user;
    return await this.authService.login(user);
  }

  @UseGuards(AuthGuard())
  @Get('logout')
  async logout(@Request() req) {
    return await this.authService.logout(req.user);
  }

  @MessagePattern('authentication.user.login-by-id')
  async loginUserById(@Payload() userId: number) {
    return await this.authService.loginById(userId);
  }

  @EventPattern('authentication.user.logout')
  async handleUserLogoutEvent(@Payload() payload: AuthenticatedUser) {
    return await this.authService.logout(payload);
  }

  @EventPattern('authentication.public-key')
  sendPublicKey() {
    return this.authConfigService.publicKey.toString();
  }
}
