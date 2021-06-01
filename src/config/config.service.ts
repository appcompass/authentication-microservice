import * as Joi from 'joi';

import { ClientOptions } from '@nestjs/microservices';

import { VaultConfig } from './vault.utils';

export type EnvConfig = Record<string, string>;

export interface ValidConfig {
  NODE_ENV: string;
  PWD: string;
  npm_package_name: string;
  npm_package_gitHead: string;
  npm_package_version: string;
  serviceHost: string;
  servicePort: number;
  interServiceTransportConfig: ClientOptions;
  publicKey: string;
  privateKey: string;
  passphrase: string;
  authExpiresIn: number;
}

export class ConfigService {
  private readonly config: ValidConfig;
  public vault: VaultConfig;
  private schema: Joi.ObjectSchema = Joi.object({
    NODE_ENV: Joi.string().default('local'),
    PWD: Joi.string(),
    npm_package_name: Joi.string(),
    npm_package_gitHead: Joi.string(),
    npm_package_version: Joi.string(),
    serviceHost: Joi.string().default('0.0.0.0'),
    servicePort: Joi.number().default(3000),
    interServiceTransportConfig: Joi.object(),
    publicKey: Joi.string(),
    privateKey: Joi.string(),
    passphrase: Joi.string(),
    authExpiresIn: Joi.number()
  }).options({ stripUnknown: true });

  constructor(config: EnvConfig) {
    this.config = this.validate({ ...process.env, ...config });
    this.vault = new VaultConfig();
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
