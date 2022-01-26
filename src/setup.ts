import { generateKeyPairSync, randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import * as Joi from 'joi';

import { Transport } from '@nestjs/microservices';

const arg = process.argv[process.argv.length - 1].trim();
const parsedArg = Object.fromEntries([arg.split(':')]);

const validator = Joi.object({
  setup: Joi.string().valid('secrets')
});

const { error } = validator.validate({ ...parsedArg });

if (error) {
  throw new Error(`validation error: ${error.message}`);
}

function generateKeyPair() {
  const passphrase = randomBytes(256 / 8).toString('hex');

  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase
    }
  });

  return { passphrase, publicKey, privateKey };
}

const commands = {
  'setup:secrets': async () => {
    const { passphrase, publicKey, privateKey } = generateKeyPair();
    const appConfig = JSON.stringify({
      rateLimit: {
        max: 0
      }
    });
    const interServiceTransportConfig = JSON.stringify({
      transport: Transport.NATS,
      options: {
        servers: ['nats://localhost:4222'],
        queue: 'authentication'
      }
    });
    try {
      writeFileSync(
        '.envrc',
        `
export SERVICE_NAME=authentication
export SERVICE_PORT=3000
export ENV=local
export AUTH_EXPIRES_IN=86400
export PUBLIC_KEY=${JSON.stringify(publicKey)}
export PRIVATE_KEY=${JSON.stringify(privateKey)}
export PASSPHRASE='${passphrase}'
export APP_CONFIG='${appConfig}'
export INTERSERVICE_TRANSPORT_CONFIG='${interServiceTransportConfig}'
`
      );
    } catch (error) {
      console.log(error);
    }
  }
};

commands[arg]();
