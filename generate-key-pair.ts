import { generateKeyPairSync, randomBytes } from 'crypto';
import { writeFileSync } from 'fs';

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
