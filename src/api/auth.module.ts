import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigService } from '../config/config.service';
import { MessagingModule } from '../messaging/messaging.module';
import { AuthConfigService } from './auth-config.service';
import { AuthController } from './controllers/auth.controller';
import { InterServiceController } from './controllers/inter-service.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    MessagingModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useClass: AuthConfigService
    })
  ],
  controllers: [AuthController, InterServiceController],
  providers: [JwtStrategy, LocalStrategy, AuthConfigService, AuthService, Logger],
  exports: [AuthService]
})
export class AuthModule {}
