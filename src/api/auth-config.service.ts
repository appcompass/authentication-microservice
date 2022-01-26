import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    return this.config;
  }

  get config(): JwtModuleOptions {
    return {
      publicKey: this.publicKey,
      privateKey: {
        key: this.configService.get('PRIVATE_KEY'),
        passphrase: this.configService.get('PASSPHRASE')
      },
      signOptions: {
        algorithm: 'RS512',
        expiresIn: this.configService.get('AUTH_EXPIRES_IN')
      }
    };
  }

  get publicKey() {
    return this.configService.get('PUBLIC_KEY');
  }
}
