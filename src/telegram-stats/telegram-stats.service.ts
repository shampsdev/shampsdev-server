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
      count: await ctx.telegram.getChatMembersCount(ctx.chatMember.chat.id),
    });

    if (ctx.chatMember.new_chat_member.status == 'member') {
      await this.statsService.createStat({
        stat_id: 'telegram_channel_joined',
        name: `последний подписчик — ${ctx.chatMember.from.first_name}`,
        count: 0,
      });
    }
  }

  @On('message')
  async onMessage(ctx: Context) {
    if (ctx.message.chat.type !== 'private') return;

    const stat_id = ctx.text.split(' ')[0];
    const count = parseInt(ctx.text.split(' ')[1]);
    const name = ctx.text.split(' ').slice(2).join(' ');

    await this.statsService.createStat({
      stat_id,
      count,
      name,
    });
  }

  @On('text')
  async onComment(ctx: Context) {
    const lastMessage = ctx.message;

    await this.statsService.createStat({
      stat_id: 'telegram_channel_commented',
      name: `${lastMessage.from.first_name} прокоментировал "${ctx.text}"`,
      count: 0,
    });
  }

  @On('boost_added')
  async onBoost(ctx: Context) {
    await this.statsService.createStat({
      stat_id: 'telegram_channel_boost',
      name: `${ctx.chatBoost.boost.source.user.first_name} кинул буст`,
      count: 0,
    });
  }
}
