import * as bcrypt from 'bcrypt';
import * as moment from 'moment';

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MessagingService } from '../../messaging/messaging.service';
import { AuthenticatedUser, DecodedToken } from '../auth.types';

@Injectable()
export class AuthService {
  private saltRounds = 10;

  constructor(
    private readonly logger: Logger,
    private readonly messagingService: MessagingService,
    private readonly jwtService: JwtService
  ) {
    this.logger.setContext('AuthService');
  }

  async setPassword(password): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async validateUser(email: string, pass: string): Promise<AuthenticatedUser | null> {
    const user: AuthenticatedUser = await this.messagingService.sendAsync('users.user.find-by', {
      email,
      active: true
    });

    if (!user) return null;
    if (await bcrypt.compare(pass, user.password)) {
      user.permissions = await this.messagingService.sendAsync('authorization.user.get-permissions', {
        userId: user.id
      });
      return user;
    } else return null;
  }

  async login(user: AuthenticatedUser) {
    const { id, email, lastLogin, permissions } = user;
    const token = await this.jwtService.signAsync({
      id,
      permissions,
      email,
      lastLogin,
      sub: id
    });
    const decodedToken = this.jwtService.decode(token) as DecodedToken;
    const payload = {
      id,
      lastLogin: moment(),
      tokenExpiration: moment.unix(decodedToken.exp)
    };
    this.messagingService.sendAsync('users.user.update', payload);
    this.logger.log(`Login from User Id: ${id}`);
    return { token };
  }

  async logout(user: AuthenticatedUser) {
    const { id } = user;
    await this.messagingService.sendAsync('users.user.update', {
      id,
      tokenExpiration: moment()
    });
    this.logger.log(`Logout from User Id: ${id}`);

    return { success: true };
  }
}
