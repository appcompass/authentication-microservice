import { readFileSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthConfigService implements JwtOptionsFactory {
  private privateKey: Buffer;
  public publicKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.publicKey = readFileSync(`${configService.get('PWD')}/keys/public.pem`);
    this.privateKey = readFileSync(`${configService.get('PWD')}/keys/private.pem`);
  }

  createJwtOptions(): JwtModuleOptions {
    return this.config;
  }

  get config(): JwtModuleOptions {
    return {
      publicKey: this.publicKey.toString(),
      privateKey: {
        key: this.privateKey.toString(),
        passphrase: this.passphrase
      },
      signOptions: {
        algorithm: 'RS512',
        expiresIn: this.expiresIn
      }
    };
  }

  get expiresIn() {
    return this.configService.get('AUTH_EXPIRES_IN');
  }

  get passphrase() {
    return this.configService.get('AUTH_PASSPHRASE');
  }
}
