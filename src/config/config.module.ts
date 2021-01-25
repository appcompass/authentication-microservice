import { Global, Module } from '@nestjs/common';

import { ConfigService } from './config.service';
import { VaultConfig } from './vault.utils';

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: async () => new ConfigService(await new VaultConfig().getServiceConfig())
    }
  ],
  exports: [ConfigService]
})
export class ConfigModule {}
