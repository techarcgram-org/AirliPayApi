import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../config/config.module';
import { Logger } from '@nestjs/common';
import { PusherService } from './pusher.service';

@Module({
  imports: [AppConfigModule],
  providers: [Logger, PusherService],
  exports: [PusherService, Logger],
})
export class PusherModule {}
