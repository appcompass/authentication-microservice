import { Module } from '@nestjs/common';

import { MessagingConfigService } from './messaging.config';
import { MessagingService } from './messaging.service';

@Module({
  providers: [MessagingService, MessagingConfigService],
  exports: [MessagingService, MessagingConfigService]
})
export class MessagingModule {}
