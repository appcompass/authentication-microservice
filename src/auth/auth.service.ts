import * as bcrypt from 'bcrypt';
import * as moment from 'moment';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MessagingService } from '../messaging/messaging.service';
import { AuthenticatedUser, DecodedToken } from './auth.types';

@Injectable()
export class AuthService {
  private saltRounds = 10;

  constructor(private readonly messagingService: MessagingService, private readonly jwtService: JwtService) {}

  async setPassword(password): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async validateUser(email: string, pass: string): Promise<AuthenticatedUser | null> {
    const user: AuthenticatedUser = await this.messagingService.sendAsync('user.find-by', {
      email,
      active: true
    });

    if (!user) return null;
    if (await bcrypt.compare(pass, user.password)) return user;
    else return null;
  }

  async login(user: AuthenticatedUser) {
    const { id, email } = user;
    const token = await this.jwtService.signAsync({
      email,
      sub: id
    });
    const decodedToken = this.jwtService.decode(token) as DecodedToken;
    const { affected } = await this.messagingService.sendAsync('user.login', { id, decodedToken });
    return affected ? { token } : { token: null };
  }

  async logout(user: AuthenticatedUser) {
    const { id } = user;
    await this.messagingService.sendAsync('user.update', {
      id,
      tokenExpiration: moment()
    });

    return { success: true };
  }
}
