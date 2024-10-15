import { Injectable } from '@nestjs/common';
import { Hears, Help, On, Start, Update } from 'nestjs-telegraf';
import { StatsService } from 'src/stats/stats.service';
import { Context } from 'telegraf';

// todo
// check the telegram id's for god's sake

@Update()
@Injectable()
export class TelegramStatsService {
  constructor(private statsService: StatsService) {}

  @On('chat_member')
  async onNewChatMembers(ctx: Context) {
    const currentCount = (await this.statsService.findLatest()).find(
      (x) => x.stat_id == 'telegram_channel_count'
    ).count;

    const updatedCount =
      currentCount +
      (ctx.chatMember.new_chat_member.status == 'member' ? 1 : -1);

    await this.statsService.createStat({
      stat_id: 'telegram_channel_count',
      name: 'в телеграм канале',
      count: updatedCount,
    });

    if (ctx.chatMember.new_chat_member.status == 'member') {
      await this.statsService.createStat({
        stat_id: 'telegram_channel_joined',
        name: `последний подписчик — ${ctx.chatMember.from.first_name}`,
        count: 0,
      });
    }
  }

  @On('text')
  async onComment(ctx: Context) {
    if (ctx.chat.type === 'private') {
      console.info('updated stat');
      const stat_id = ctx.text.split(' ')[0];
      const count = parseInt(ctx.text.split(' ')[1]);
      const name = ctx.text.split(' ').slice(2).join(' ');
      await this.statsService.createStat({
        stat_id,
        count,
        name,
      });
    } else {
      console.info('added comment');
      await this.statsService.createStat({
        stat_id: 'telegram_channel_commented',
        name: `"${ctx.text}"`,
        count: 0,
      });
    }
  }
}
