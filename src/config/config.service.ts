import * as Joi from 'joi';

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ClientOptions } from '@nestjs/microservices';

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
  SERVICE_NAME: string;
  SERVICE_PORT: number;
  NODE_ENV: string;
  GIT_HASH: string;
  GIT_TAG: string;
  ENV: string;
  PUBLIC_KEY: string;
  PRIVATE_KEY: string;
  PASSPHRASE: string;
  AUTH_EXPIRES_IN: number;
  APP_CONFIG: AppConfig;
  INTERSERVICE_TRANSPORT_CONFIG: ClientOptions;
}

const extendedJoi = Joi.extend(
  (joi) => ({
    type: 'object',
    base: joi.object(),
    coerce(value) {
      try {
        return { value: JSON.parse(value) };
      } catch (error) {
        return { error };
      }
    }
  }),
  (joi) => ({
    type: 'string',
    base: joi.string(),
    coerce(value) {
      try {
        return {
          value: value.replace(/\\n/g, '\n')
        };
      } catch (error) {
        return { error };
      }
    }
  })
);

export class ConfigService {
  private config: ValidConfig;
  private schema: Joi.ObjectSchema = Joi.object({
    SERVICE_NAME: Joi.string(),
    SERVICE_PORT: Joi.number().default(3000),
    ENV: Joi.string().default('local'),
    NODE_ENV: Joi.string().default('local'),
    GIT_HASH: Joi.string().default('latest'),
    GIT_TAG: Joi.string().default('latest'),
    PUBLIC_KEY: extendedJoi.string().required(),
    PRIVATE_KEY: extendedJoi.string().required(),
    PASSPHRASE: Joi.string().required(),
    AUTH_EXPIRES_IN: Joi.number(),
    APP_CONFIG: extendedJoi.object().required(),
    INTERSERVICE_TRANSPORT_CONFIG: extendedJoi.object().required()
  }).options({ stripUnknown: true, convert: true });

  constructor(env: EnvConfig = process.env) {
    this.config = this.validate(env);
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
