import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersController } from './user.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/core/mail/mail.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UserService, PrismaService, JwtService, MailService],
  exports: [UserService],
})
export class UserModule {}
