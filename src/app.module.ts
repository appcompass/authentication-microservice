import { Module } from '@nestjs/common';

import { AuthModule } from './api/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [ConfigModule, AuthModule, MessagingModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
