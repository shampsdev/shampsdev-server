import { Test, TestingModule } from '@nestjs/testing';
import { GithubStatsController } from './github-stats.controller';

describe('GithubStatsController', () => {
  let controller: GithubStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GithubStatsController],
    }).compile();

    controller = module.get<GithubStatsController>(GithubStatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
