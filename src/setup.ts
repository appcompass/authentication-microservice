import { generateKeyPairSync, randomBytes } from 'crypto';
import * as Joi from 'joi';
import * as vault from 'node-vault';

import { Transport } from '@nestjs/microservices';

const arg = process.argv[process.argv.length - 1].trim();
const parsedArg = Object.fromEntries([arg.split(':')]);

const validator = Joi.object({
  secrets: Joi.string().valid('init')
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
  'secrets:init': async () => {
    const { passphrase, publicKey, privateKey } = generateKeyPair();

    const client = vault({
      token: process.env.VAULT_TOKEN
    });

    return await Promise.all(
      [
        { key: 'secret/service/shared/publicKey', value: publicKey },
        { key: 'secret/service/authentication/privateKey', value: privateKey },
        { key: 'secret/service/authentication/passphrase', value: passphrase },
        { key: 'secret/service/shared/authenticationServiceHost', value: '0.0.0.0' },
        { key: 'secret/service/shared/authenticationServicePort', value: process.env.SERVICE_PORT || 3000 },
        {
          key: 'secret/service/authentication/interServiceTransportConfig',
          value:
            process.env.INTERSERVICE_TRANSPORT_CONFIG ||
            JSON.stringify({
              transport: Transport.NATS,
              options: {
                url: 'nats://localhost:4222',
                queue: 'authentication'
              }
            })
        },
        { key: 'secret/service/authentication/authExpiresIn', value: process.env.AUTH_EXPIRES_IN || 86400 }
      ].map(({ key, value }) => client.write(key, { value }))
    ).then(() => console.log('key pair secrets and config set'));
  }
};

commands[arg]();
