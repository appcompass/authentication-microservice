import { Controller, Get, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../services/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly logger: Logger, private readonly authService: AuthService) {
    this.logger.setContext(this.constructor.name);
  }

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
}
