import { Injectable, Logger } from '@nestjs/common';
import { On, Start, Update } from 'nestjs-telegraf';
import { StatsService } from 'src/stats/stats.service';
import { Context, Markup } from 'telegraf';

@Update()
@Injectable()
export class TelegramStatsService {
  private readonly logger = new Logger(TelegramStatsService.name);

  constructor(private statsService: StatsService) {}

  @On('chat_member')
  async onNewChatMembers(ctx: Context) {
    const chatId = ctx.chat?.id;
    const channelId = parseInt(process.env.TELEGRAM_CHANNEL_ID);

    if (chatId !== channelId) {
      this.logger.debug(`Ignored chat_member update from chat ${chatId}`);
      return;
    }

    const status = ctx.chatMember?.new_chat_member?.status;
    const username = ctx.chatMember?.from?.username || ctx.chatMember?.from?.first_name;

    this.logger.log(`chat_member event: ${username} -> ${status}`);

    const currentCount = (await this.statsService.findLatest()).find(
      (x) => x.stat_id === 'telegram_channel_count'
    )?.count ?? 0;

    const updatedCount = currentCount + (status === 'member' ? 1 : -1);

    await this.statsService.createStat({
      stat_id: 'telegram_channel_count',
      name: 'в телеграм канале',
      count: updatedCount,
    });

    this.logger.log(`Updated telegram_channel_count to ${updatedCount}`);

    if (status === 'member') {
      await this.statsService.createStat({
        stat_id: 'telegram_channel_joined',
        name: `последний подписчик — ${ctx.chatMember.from.first_name}`,
        count: 0,
      });

      this.logger.log(`Recorded new subscriber: ${ctx.chatMember.from.first_name}`);
    }
  }

  @Start()
  async startCommand(ctx: Context) {
    const userId = ctx.from?.id;
    const channelId = parseInt(process.env.TELEGRAM_CHANNEL_ID);

    const isAdmin = await ctx.telegram
      .getChatMember(channelId, userId)
      .then((x) => x.status === 'administrator' || x.status === 'creator')
      .catch((err) => {
        this.logger.warn(`Failed to check admin status for user ${userId}: ${err.message}`);
        return false;
      });

    if (!isAdmin) {
      this.logger.warn(`User ${userId} tried to access /start but is not admin`);
      return;
    }

    this.logger.log(`Admin ${ctx.from.username || ctx.from.first_name} started interaction`);

    await ctx.reply(
      'Welcome! Use the keyboard to update stats. To update a custom value send a message in the following format \n\n [stat_id] [count] \n\n coffee_cups \n sleepless_nights \n github_commit_count \n telegram_channel_count \n telegram_channel_joined \n commits',
      Markup.keyboard([
        Markup.button.callback('Update Coffee Cups', 'update_coffee_cups'),
        Markup.button.callback('Update Sleepless Nights', 'update_sleepless_nights'),
      ])
    );
  }

  @On('text')
  async onText(ctx: Context) {
    const message = ctx.text;
    const userId = ctx.from?.id;
    const username = ctx.from?.username || ctx.from?.first_name;
    const channelId = parseInt(process.env.TELEGRAM_CHANNEL_ID);

    const isAdmin = await ctx.telegram
      .getChatMember(channelId, userId)
      .then((x) => x.status === 'administrator' || x.status === 'creator')
      .catch((err) => {
        this.logger.warn(`Failed to check admin status for user ${userId}: ${err.message}`);
        return false;
      });

    if (!isAdmin) {
      this.logger.warn(`User ${userId} (${username}) tried to send command "${message}" but is not admin`);
      return;
    }

    this.logger.log(`Received message from admin ${username}: ${message}`);

    const stats = await this.statsService.findLatest();

    if (message === 'Update Coffee Cups') {
      const currentStat = stats.find((x) => x.stat_id === 'coffee_cups');
      const updatedCount = currentStat ? currentStat.count + 1 : 1;

      await this.statsService.createStat({
        stat_id: 'coffee_cups',
        name: currentStat?.name || 'Coffee Cups',
        count: updatedCount,
      });

      this.logger.log(`Updated coffee_cups to ${updatedCount}`);
      await ctx.reply(`Coffee cups updated to ${updatedCount}!`);
    } else if (message === 'Update Sleepless Nights') {
      const currentStat = stats.find((x) => x.stat_id === 'sleepless_nights');
      const updatedCount = currentStat ? currentStat.count + 1 : 1;

      await this.statsService.createStat({
        stat_id: 'sleepless_nights',
        name: currentStat?.name || 'Sleepless Nights',
        count: updatedCount,
      });

      this.logger.log(`Updated sleepless_nights to ${updatedCount}`);
      await ctx.reply(`Sleepless nights updated to ${updatedCount}!`);
    } else {
      const customData = message.trim().split(' ');

      if (customData.length !== 2) {
        this.logger.warn(`Invalid custom format from ${username}: ${message}`);
        await ctx.reply(`Unknown format.`);
        return;
      }

      const [statId, countStr] = customData;
      const parsedCount = parseInt(countStr);
      if (isNaN(parsedCount)) {
        this.logger.warn(`Invalid number provided by ${username}: ${countStr}`);
        await ctx.reply(`Invalid number format.`);
        return;
      }

      const currentStat = stats.find((x) => x.stat_id === statId);
      if (!currentStat) {
        this.logger.warn(`Unknown stat_id provided by ${username}: ${statId}`);
        await ctx.reply(`Unknown current stat.`);
        return;
      }

      await this.statsService.createStat({
        stat_id: currentStat.stat_id,
        name: currentStat.name,
        count: parsedCount,
      });

      this.logger.log(`Updated ${statId} to ${parsedCount}`);
      await ctx.reply(`${currentStat.name} updated to ${parsedCount}!`);
    }
  }
}
