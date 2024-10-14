import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { StatsService } from './stats.service';
import { Stat } from './stat.entity';
import { CreateStatInput } from './dto/create-stat.input';
import { PubSub } from 'graphql-subscriptions';

export const pubSub = new PubSub();

@Resolver(() => Stat)
export class StatsResolver {
  constructor(private statService: StatsService) {}

  @Query(() => [Stat])
  async stats(): Promise<Stat[]> {
    return this.statService.findLatest();
  }

  @Mutation(() => Stat)
  async createStat(
    @Args('createStatInput') createStatInput: CreateStatInput,
  ): Promise<Stat> {
    const newStat = await this.statService.createStat(createStatInput);
    const newStats = await this.statService.findLatest();
    pubSub.publish('statCreated', { statCreated: newStats });
    return newStat;
  }

  @Subscription(() => [Stat])
  statCreated() {
    return pubSub.asyncIterator('statCreated');
  }
}
