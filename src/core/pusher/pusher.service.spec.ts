import { Test, TestingModule } from '@nestjs/testing';
import { PusherService } from './pusher.service';
import { AppConfigService } from '../../config/config.service';
import { Logger } from '@nestjs/common';

describe('PusherService', () => {
  let pusherService: PusherService;
  let appConfigService: AppConfigService;
  let logger: Logger;

  const mockAppConfigService = {
    pusher: {
      key: 'test_key',
      wsHost: 'test_host',
      secret: 'test_secret',
      appId: 'test_app_id',
      useTLS: true,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PusherService,
        Logger,
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
      ],
    }).compile();

    pusherService = module.get<PusherService>(PusherService);
    appConfigService = module.get<AppConfigService>(AppConfigService);
    logger = module.get<Logger>(Logger);
  });

  describe('trigger', () => {
    it('should trigger the event on the specified channel', async () => {
      const channel = 'test_channel';
      const event = 'test_event';
      const data = { test: 'data' };
      const triggerSpy = jest.spyOn(pusherService['pusher'], 'trigger');
      await pusherService.trigger(channel, event, data);
      expect(triggerSpy).toHaveBeenCalledWith(channel, event, data);
    });
  });
});
