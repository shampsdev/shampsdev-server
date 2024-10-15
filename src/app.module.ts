import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StatsModule } from './stats/stats.module';
import { GraphQLModule } from '@nestjs/graphql/dist/graphql.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramStatsService } from './telegram-stats/telegram-stats.service';
import { PubSubService } from './pub-sub/pub-sub.service';
import { GithubStatsService } from './github-stats/github-stats.service';
import { GithubStatsController } from './github-stats/github-stats.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      installSubscriptionHandlers: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: process.env.AUTO_MIGRATE === 'True',
    }),
    TelegrafModule.forRoot({
      token: process.env.BOT_KEY,
      launchOptions: {
        allowedUpdates: [
          'chat_member',
          'chat_boost',
          'removed_chat_boost',
          'message',
        ],
      },
    }),
    StatsModule,
  ],
  controllers: [AppController, GithubStatsController],
  providers: [AppService, StatsModule, TelegramStatsService, PubSubService, GithubStatsService],
})
export class AppModule {}
