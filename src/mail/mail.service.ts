import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import SendEmailOptions from 'src/interfaces/sendEmailOptions.interface';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(options: SendEmailOptions) {
    await this.mailerService.sendMail(options);
  }
}
