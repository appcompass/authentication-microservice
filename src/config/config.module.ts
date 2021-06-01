import { Global, Module } from '@nestjs/common';

import { ConfigService } from './config.service';

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: async () => await new ConfigService().setConfigFromVault()
    }
  ],
  exports: [ConfigService]
})
export class ConfigModule {}
