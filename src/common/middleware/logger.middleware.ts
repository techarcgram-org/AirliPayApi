// logger.middleware.ts

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logPrefix } from '../utils';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const { statusCode } = res;
      const start = process.hrtime();
      const end = process.hrtime(start);
      const contentLength = res.get('content-length');
      const durationInMs = (end[0] * 1e9 + end[1]) / 1e6; // Convert duration to milliseconds
      this.logger.log(
        `${logPrefix()} - [${method}] - ${originalUrl} ${statusCode} - ${durationInMs}ms `,
      );
    });

    next();
  }
}
