import { generateKeyPairSync, randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import * as Joi from 'joi';

const arg = process.argv[process.argv.length - 1].trim();
const parsedArg = Object.fromEntries([arg.split(':')]);

const validator = Joi.object({
  generate: Joi.string().valid('keys', 'dotenv')
});

const { error } = validator.validate({ ...parsedArg });

if (error) {
  throw new Error(`validation error: ${error.message}`);
}

const commands = {
  'generate:keys': () => {
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

    console.log('Passphrase: ', passphrase);

    writeFileSync(`${__dirname}/keys/public.pem`, publicKey);
    writeFileSync(`${__dirname}/keys/private.pem`, privateKey);

    console.log('private and public keys created.');
  },
  'generate:dotenv': () => {
    const passphrase = randomBytes(256 / 8).toString('hex');
    const localEnvFile = `SERVICE_PORT=3000\nAUTH_PASSPHRASE=${passphrase}\nAUTH_EXPIRES_IN=86400`;

    writeFileSync(`${__dirname}/local.env`, localEnvFile);

    console.log('Passphrase: ', passphrase);

    console.log('local.env file created.');
  }
};

commands[arg]();
