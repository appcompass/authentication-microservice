import { Global, Module } from '@nestjs/common';

import { ConfigService } from './config.service';
import { getVaultConfig } from './vault.utils';

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: async () => new ConfigService(await getVaultConfig())
    }
  ],
  exports: [ConfigService]
})
export class ConfigModule {}
