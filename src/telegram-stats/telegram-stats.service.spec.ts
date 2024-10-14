import { Test, TestingModule } from '@nestjs/testing';
import { TelegramStatsService } from './telegram-stats.service';

describe('TelegramStatsService', () => {
  let service: TelegramStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramStatsService],
    }).compile();

    service = module.get<TelegramStatsService>(TelegramStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
