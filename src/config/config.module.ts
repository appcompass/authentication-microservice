import * as vault from 'node-vault';

import { Global, Module } from '@nestjs/common';

import { ConfigService } from './config.service';

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: async () => {
        const client = vault({
          token: process.env.VAULT_TOKEN
        });
        try {
          const [
            serviceHost,
            servicePort,
            natsUrl,
            publicKey,
            natsQueue,
            privateKey,
            passphrase,
            authExpiresIn
          ] = await Promise.all(
            [
              'secret/service/shared/authenticationServiceHost',
              'secret/service/shared/authenticationServicePort',
              'secret/service/shared/natsUrl',
              'secret/service/shared/publicKey',
              'secret/service/authentication/natsQueue',
              'secret/service/authentication/privateKey',
              'secret/service/authentication/passphrase',
              'secret/service/authentication/authExpiresIn'
            ].map((path) => client.read(path).then(({ data }) => data.value))
          );
          return new ConfigService({
            serviceHost,
            servicePort,
            natsUrl,
            publicKey,
            natsQueue,
            privateKey,
            passphrase,
            authExpiresIn
          });
        } catch (error) {
          throw Error(error.response.body.warnings);
        }
      }
    }
  ],
  exports: [ConfigService]
})
export class ConfigModule {}
