import * as Joi from 'joi';

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ClientOptions } from '@nestjs/microservices';

import { VaultConfig } from './vault.utils';

export type EnvConfig = Record<string, string>;

export interface AppConfig {
  rateLimit: {
    windowMs?: number;
    max?: number;
    message?: string;
    statusCode?: number;
    headers?: boolean;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
  };
  corsOptions: CorsOptions;
}

export interface ValidConfig {
  NODE_ENV: string;
  GIT_HASH: string;
  GIT_TAG: string;
  npm_package_name: string;
  serviceHost: string;
  servicePort: number;
  appConfig: AppConfig;
  interServiceTransportConfig: ClientOptions;
  publicKey: string;
  privateKey: string;
  passphrase: string;
  authExpiresIn: number;
}

export class ConfigService {
  private config: ValidConfig;
  public vault: VaultConfig;
  private schema: Joi.ObjectSchema = Joi.object({
    NODE_ENV: Joi.string().default('local'),
    npm_package_name: Joi.string(),
    GIT_HASH: Joi.string().default('latest'),
    GIT_TAG: Joi.string().default('latest'),
    serviceHost: Joi.string().default('0.0.0.0'),
    servicePort: Joi.number().default(3000),
    appConfig: Joi.object(),
    interServiceTransportConfig: Joi.object(),
    publicKey: Joi.string(),
    privateKey: Joi.string(),
    passphrase: Joi.string(),
    authExpiresIn: Joi.number()
  }).options({ stripUnknown: true });

  async setConfigFromVault() {
    this.vault = new VaultConfig(process.env.npm_package_name);
    const config: EnvConfig = await this.vault.getServiceConfig();
    this.config = this.validate({ ...process.env, ...config });

    return this;
  }

  private validate(config: EnvConfig): ValidConfig {
    const { error, value } = this.schema.validate(config);

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return value;
  }

  public get<K extends keyof ValidConfig>(key: K): ValidConfig[K] {
    return this.config[key];
  }
}
