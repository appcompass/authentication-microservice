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
        key: this.privateKey,
        passphrase: this.passphrase
      },
      signOptions: {
        algorithm: 'RS512',
        expiresIn: this.expiresIn
      }
    };
  }

  get publicKey() {
    return this.configService.get('publicKey');
  }
  get privateKey() {
    return this.configService.get('privateKey');
  }
  get passphrase() {
    return this.configService.get('passphrase');
  }
  get expiresIn() {
    return this.configService.get('authExpiresIn');
  }
}
