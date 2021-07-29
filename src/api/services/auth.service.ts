import * as bcrypt from 'bcrypt';
import * as moment from 'moment';

import { ConsoleLogger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MessagingService } from '../../messaging/messaging.service';
import { AuthenticatedUser } from '../auth.types';

@Injectable()
export class AuthService {
  private saltRounds = 10;

  constructor(
    private readonly logger: ConsoleLogger,
    private readonly messagingService: MessagingService,
    private readonly jwtService: JwtService
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async setPassword(password): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async validateUser(email: string, pass: string): Promise<AuthenticatedUser | null> {
    const user: AuthenticatedUser = await this.messagingService.sendAsync('users.user.find-by', {
      email,
      active: true
    });
    if (!user || !user.password) return null;
    if (await bcrypt.compare(pass, user.password)) {
      user.permissions = await this.messagingService.sendAsync('authorization.user.get-permission-names', {
        userId: user.id
      });
      return user;
    } else return null;
  }

  async loginBy(payload: Partial<{ id: number; email: string }>) {
    const user = await this.buildUserTokenObject(payload);
    if (!user) return null;

    return await this.login(user);
  }

  async buildUserTokenObject(payload: Partial<{ id: number; email: string }>) {
    const user: AuthenticatedUser = await this.messagingService.sendAsync('users.user.find-by', {
      ...payload,
      active: true
    });
    if (!user || !user.id) return null;
    user.permissions = await this.messagingService.sendAsync('authorization.user.get-permission-names', {
      userId: user.id
    });

    return user;
  }

  async generateRefreshToken(user: AuthenticatedUser) {
    const { id } = user;
    return await this.jwtService.signAsync({
      sub: id,
      type: 'refresh'
    });
  }

  async generateAccessToken(user: AuthenticatedUser) {
    const { id, email, lastLogin, permissions } = user;
    return await this.jwtService.signAsync(
      {
        id,
        permissions,
        email,
        lastLogin,
        sub: id,
        type: 'access'
      },
      {
        expiresIn: 60 * 15
      }
    );
  }

  async generateAccessTokenById(id: number) {
    const user = await this.buildUserTokenObject({ id });
    if (!user) return null;
    return await this.generateAccessToken(user);
  }

  async generateRefreshTokenById(id: number) {
    const user: AuthenticatedUser = await this.messagingService.sendAsync('users.user.find-by', {
      id,
      active: true
    });

    if (!user || !user.id) return null;
    return await this.generateRefreshToken(user);
  }

  async login(user: AuthenticatedUser) {
    const [refreshToken, accessToken] = await Promise.all([
      this.generateRefreshToken(user),
      this.generateAccessToken(user)
    ]);

    await this.messagingService.sendAsync('users.user.update', {
      id: user.id,
      lastLogin: moment()
    });
    this.logger.log(`Login from User Id: ${user.id}`);
    return { refreshToken, accessToken };
  }

  async logout(user: AuthenticatedUser) {
    const { id } = user;
    await this.messagingService.sendAsync('users.user.update', {
      id,
      lastLogout: moment()
    });
    this.logger.log(`Logout from User Id: ${id}`);

    return { success: true };
  }

  async createToken(payload: Record<string | number | symbol, unknown>) {
    return await this.jwtService.signAsync(payload);
  }
}
