import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { GithubStatsService } from './github-stats.service';

@Controller('github-stats')
export class GithubStatsController {
  constructor(private readonly githubStatsService: GithubStatsService) {}

  @Post('github')
  handleGithubWebhook(@Req() req: Request) {
    const event = req.headers['x-github-event'];

    if (event === 'push') {
      const payload = req.body;

      console.log(payload);

      return HttpStatus.OK;
    } else {
      return HttpStatus.BAD_REQUEST;
    }
  }
}
