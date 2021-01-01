import { generateKeyPairSync, randomBytes } from 'crypto';
import * as Joi from 'joi';
import * as vault from 'node-vault';

const arg = process.argv[process.argv.length - 1].trim();
const parsedArg = Object.fromEntries([arg.split(':')]);

const validator = Joi.object({
  generate: Joi.string().valid('secrets')
});

const { error } = validator.validate({ ...parsedArg });

if (error) {
  throw new Error(`validation error: ${error.message}`);
}
const commands = {
  'generate:secrets': async () => {
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
    const client = vault({
      token: process.env.VAULT_ADMIN_TOKEN
    });

    await Promise.all([
      client
        .write('secret/service/shared/authenticationServiceHost', {
          value: '0.0.0.0'
        })
        .catch(console.error),
      client
        .write('secret/service/shared/authenticationServicePort', {
          value: 3000
        })
        .catch(console.error),
      client
        .write('secret/service/shared/natsUrl', {
          value: 'nats://localhost:4222'
        })
        .catch(console.error),
      client
        .write('secret/service/shared/publicKey', {
          value: publicKey
        })
        .catch(console.error),
      client
        .write('secret/service/authentication/natsQueue', {
          value: 'authentication'
        })
        .catch(console.error),
      client
        .write('secret/service/authentication/privateKey', {
          value: privateKey
        })
        .catch(console.error),
      client
        .write('secret/service/authentication/passphrase', {
          value: passphrase
        })
        .catch(console.error),
      client
        .write('secret/service/authentication/authExpiresIn', {
          value: 86400
        })
        .catch(console.error)
    ]).then(() => console.log('secrets set'));
  }
};

commands[arg]();
