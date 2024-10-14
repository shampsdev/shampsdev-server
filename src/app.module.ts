import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StatsModule } from './stats/stats.module';
import { GraphQLModule } from '@nestjs/graphql/dist/graphql.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramModule } from 'nestjs-telegram';
import { TelegramStatsService } from './telegram-stats/telegram-stats.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/shema.gql'),
      sortSchema: true,
      installSubscriptionHandlers: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TelegramModule.forRoot({
      botKey: 'YourBotApiToken',
    }),
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService, TelegramStatsService],
})
export class AppModule {}
