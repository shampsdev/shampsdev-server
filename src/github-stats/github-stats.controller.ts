import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { GithubStatsService } from './github-stats.service';
import { StatsService } from 'src/stats/stats.service';

// todo
// move most of these methods into the service
// add security features

@Controller('github-stats')
export class GithubStatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post()
  async handleGithubWebhook(@Req() req: Request) {
    const event = req.headers['x-github-event'];
    console.log(req);

    if (event === 'push') {
      const currentCount =
        (await this.statsService.findLatest()).find(
          (x) => x.stat_id == 'github_commit_count'
        )?.count ?? 0;

      const updatedCount = currentCount + 1;

      await this.statsService.createStat({
        stat_id: 'github_commit_count',
        name: 'коммитов',
        count: updatedCount,
      });

      return HttpStatus.OK;
    } else {
      return HttpStatus.BAD_REQUEST;
    }
  }
}
