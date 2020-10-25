import * as dotenv from 'dotenv';
import * as Joi from 'joi';

export type EnvConfig = Record<string, string>;

export interface ValidConfig {
  NODE_ENV: string;
  PWD: string;
  SERVICE_HOST: string;
  SERVICE_PORT: number;
  REDIS_URL: string;
  NATS_URL: string;
  AMQP_QUEUE: string;
  AUTH_PASSPHRASE: string;
  AUTH_EXPIRES_IN: number;
  npm_package_name: string;
  npm_package_gitHead: string;
  npm_package_version: string;
}

export class ConfigService {
  private readonly config: ValidConfig;
  private schema: Joi.ObjectSchema = Joi.object({
    NODE_ENV: Joi.string().default('local'),
    PWD: Joi.string(),
    SERVICE_HOST: Joi.string().default('0.0.0.0'),
    SERVICE_PORT: Joi.number().default(3000),
    REDIS_URL: Joi.string().default('redis://localhost:6379'),
    NATS_URL: Joi.string().default(['nats://localhost:4222']),
    AUTH_PASSPHRASE: Joi.string(),
    AUTH_EXPIRES_IN: Joi.number(),
    npm_package_name: Joi.string(),
    npm_package_gitHead: Joi.string(),
    npm_package_version: Joi.string()
  }).options({ stripUnknown: true });

  constructor(path: string = `${process.env.NODE_ENV || 'local'}.env`) {
    dotenv.config({ path });
    this.config = this.validate(process.env);
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
