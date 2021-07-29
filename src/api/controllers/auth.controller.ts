import { ConsoleLogger, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../services/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly logger: ConsoleLogger, private readonly authService: AuthService) {
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

  @UseGuards(AuthGuard())
  @Get('refresh')
  async refresh(@Request() req) {
    return await this.authService.generateAccessToken(req.user);
  }
}
