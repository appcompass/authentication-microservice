import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { MessagingService } from 'src/messaging/messaging.service';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { DecodedToken } from './types/token';

@Injectable()
export class AuthService {
  private saltRounds = 10;

  constructor(
    private readonly messagingService: MessagingService,
    private readonly jwtService: JwtService
  ) {}

  async setPassword(password): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async validateUser(email: string, pass: string): Promise<any | null> {
    const user = await this.messagingService.sendAsync<any, any>(
      'user.find-by',
      {
        email,
        active: true
      }
    );
    if (!user) return null;
    if (await bcrypt.compare(pass, user.password)) return user;
    else return null;
  }

  async login(user: any) {
    const { id, email } = user;
    const payload = { email, sub: id };
    const token = await this.jwtService.signAsync(payload);
    const decoded = this.jwtService.decode(token) as DecodedToken;

    await this.messagingService.sendAsync('user.update', {
      id,
      lastLogin: moment(),
      tokenExpiration: moment.unix(decoded.exp)
    });

    return { token };
  }

  async logout(user: any) {
    await this.messagingService.sendAsync('user.update', {
      id: user.id,
      tokenExpiration: moment()
    });

    return { success: true };
  }
}
