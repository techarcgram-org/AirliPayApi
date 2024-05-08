import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../../common/constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const account = await this.authService.validateUser(username, password);
    if (!account) {
      throw new UnauthorizedException();
    }
    const userIsAdmin = account.account_type === Role.ADMIN;
    const userIsManager = account.account_type === Role.CLIENT;

    let userRole = Role.USER;
    if (userIsManager) userRole = Role.CLIENT;
    if (userIsAdmin) userRole = Role.ADMIN;

    return {
      ...account,
      roles: [userRole],
    };
  }
}
