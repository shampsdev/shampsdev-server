import { Injectable } from '@nestjs/common';
import { Hears, Help, On, Start, Update } from 'nestjs-telegraf';
import { StatsService } from 'src/stats/stats.service';
import { Context } from 'telegraf';

@Update()
@Injectable()
export class TelegramStatsService {
  constructor(private statsService: StatsService) {}

  @On('chat_member')
  async onNewChatMembers(ctx: Context) {
    await this.statsService.createStat({
      stat_id: 'telegram_channel_count',
      name: 'подписчиков в телеграм канале',
      count: await ctx.getChatMembersCount(),
    });
  }

  @On('boost_added')
  async onBoost(ctx: Context) {
    console.log(ctx.botInfo);
  }
}
