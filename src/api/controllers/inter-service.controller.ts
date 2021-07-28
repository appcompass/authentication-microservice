import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { AuthConfigService } from '../auth-config.service';
import { AuthenticatedUser } from '../auth.types';
import { AuthService } from '../services/auth.service';

@Controller()
export class InterServiceController {
  constructor(private readonly authService: AuthService, private readonly authConfigService: AuthConfigService) {}

  @MessagePattern('authentication.user.login-by-id')
  async loginUserById(@Payload() id: number) {
    return await this.authService.loginBy({ id });
  }

  @MessagePattern('authentication.user.login-by-email')
  async loginUserByEmail(@Payload() email: string) {
    return await this.authService.loginBy({ email });
  }

  @MessagePattern('authentication.user.get-access-token')
  async getAccessTokenByUserId(@Payload() id: number) {
    return await this.authService.generateAccessTokenById(id);
  }

  @MessagePattern('authentication.user.get-refresh-token')
  async getRefreshTokenByUserId(@Payload() id: number) {
    return await this.authService.generateRefreshTokenById(id);
  }

  @MessagePattern('authentication.user.get-tokens')
  async getTokensByUserId(@Payload() id: number) {
    const [refreshToken, accessToken] = await Promise.all([
      this.authService.generateRefreshTokenById(id),
      this.authService.generateAccessTokenById(id)
    ]);
    return { refreshToken, accessToken };
  }

  @MessagePattern('authentication.token.create')
  async createToken(@Payload() payload: Record<string | number | symbol, unknown>) {
    return await this.authService.createToken(payload);
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
