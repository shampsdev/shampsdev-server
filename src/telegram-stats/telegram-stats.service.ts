import { Injectable } from '@nestjs/common';
import { On, Start, Update } from 'nestjs-telegraf';
import { StatsService } from 'src/stats/stats.service';
import { Context, Markup } from 'telegraf';

// todo
// check the telegram id's for god's sake

@Update()
@Injectable()
export class TelegramStatsService {
  constructor(private statsService: StatsService) {}

  @On('chat_member')
  async onNewChatMembers(ctx: Context) {
    if (ctx.chat.id !== parseInt(process.env.TELEGRAM_CHANNEL_ID)) return;

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

  @Start()
  async startCommand(ctx: Context) {
    const isAdmin = ctx.telegram
      .getChatMember(parseInt(process.env.TELEGRAM_CHANNEL_ID), ctx.from.id)
      .then((x) => x.status === 'administrator' || x.status === 'creator');

    if (!isAdmin) return;

    await ctx.reply(
      'Welcome! Use the keyboard to update stats. To update a custom value send a message in the following format \n\n [stat_id] [count] \n\n coffee_cups \n sleepless_nights \n github_commit_count \n telegram_channel_count \n telegram_channel_joined \n commits',
      Markup.keyboard([
        Markup.button.callback('Update Coffee Cups', 'update_coffee_cups'),
        Markup.button.callback(
          'Update Sleepless Nights',
          'update_sleepless_nights'
        ),
      ])
    );
  }

  @On('text')
  async onText(ctx: Context) {
    const message = ctx.text;

    const isAdmin = ctx.telegram
      .getChatMember(parseInt(process.env.TELEGRAM_CHANNEL_ID), ctx.from.id)
      .then((x) => x.status === 'administrator' || x.status === 'creator');

    if (!isAdmin) return;

    if (message === 'Update Coffee Cups') {
      const currentStat = (await this.statsService.findLatest()).find(
        (x) => x.stat_id == 'coffee_cups'
      );

      const updatedCount = currentStat ? currentStat.count + 1 : 1;

      await this.statsService.createStat({
        stat_id: 'coffee_cups',
        name: currentStat.name,
        count: updatedCount,
      });

      await ctx.reply(`Coffee cups updated to ${updatedCount}!`);
    } else if (message === 'Update Sleepless Nights') {
      const currentStat = (await this.statsService.findLatest()).find(
        (x) => x.stat_id == 'sleepless_nights'
      );

      const updatedCount = currentStat ? currentStat.count + 1 : 1;

      await this.statsService.createStat({
        stat_id: 'sleepless_nights',
        name: currentStat.name,
        count: updatedCount,
      });

      await ctx.reply(`Sleepless nigts updated to ${updatedCount}!`);
    } else {
      const custom_data = message.split(' ');
      if (custom_data.length > 2) {
        await ctx.reply(`Unknown format.`);
        return;
      }

      const currentStat = (await this.statsService.findLatest()).find(
        (x) => x.stat_id == custom_data[0]
      );

      if (currentStat == undefined) {
        await ctx.reply(`Unknown current stat.`);
        return;
      }

      await this.statsService.createStat({
        stat_id: currentStat.stat_id,
        name: currentStat.name,
        count: parseInt(custom_data[1]),
      });

      await ctx.reply(
        `${currentStat.name} updated to ${parseInt(custom_data[1])}!`
      );
    }
  }
}
