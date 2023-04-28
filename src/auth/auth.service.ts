import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MailService } from './../mail/mail.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserWithAccounts } from 'src/types/user.type';

@Injectable()
export class AuthService {
  constructor(
    private mailService: MailService,
    private userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(username);
    if (
      user &&
      bcrypt.compareSync(password, user.accounts.encrypted_password)
    ) {
      // const { encrypted_password, ...result } = user;
      user['accounts']['encrypted_password'] = null;
      return user;
    }
    throw new UnauthorizedException();
  }

  async login(user: UserWithAccounts) {
    const payload = { username: user.accounts.email, sub: user.id };
    delete user['accounts']['encrypted_password'];
    return {
      access_token: this.jwtService.sign(payload),
      data: user,
    };
  }
}