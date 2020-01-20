import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [ConfigModule, AuthModule, MessagingModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
