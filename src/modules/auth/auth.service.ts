import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from 'src/common/constants';
import { PrismaService } from 'src/common/services/prisma.service';
import { logPrefix } from 'src/common/utils/util';
import { accounts } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private logger: Logger,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const account = await this.prismaService.accounts.findFirst({
      where: {
        email: username,
      },
      include: {
        users: true,
        clients: true,
        admins: true,
      },
    });
    console.log(username, account);
    if (
      account &&
      bcrypt.compareSync(password, account.encrypted_password) &&
      account.account_status === AccountStatus.ACTIVE
    ) {
      // const { encrypted_password, ...result } = user;
      account['encrypted_password'] = null;
      return account;
    }
    this.logger.error(`${logPrefix()} ${'error loggin in'}`);
    throw new UnauthorizedException();
  }

  async login(account: any, remember: boolean) {
    this.logger.debug(`Logging in user: ${account.email}`);
    const sub =
      account.clients.length === 1
        ? account.clients[0].id
        : account.users.length === 1
        ? account.users[0].id
        : account.admins[0].id;
    const payload = {
      username: account.email,
      sub: sub,
      roles: account.roles,
    };
    delete account['encrypted_password'];
    return {
      access_token: remember
        ? this.jwtService.sign(payload, { expiresIn: '30d' })
        : this.jwtService.sign(payload, { expiresIn: '1d' }),
      data: account,
    };
  }

  tokenIsValid(token: string): boolean {
    try {
      this.jwtService.verify(token);
      return true;
    } catch (error) {
      return false;
    }
  }
}
