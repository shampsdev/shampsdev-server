import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { StatsService } from './stats.service';
import { Stat } from './stat.entity';
import { CreateStatInput } from './dto/create-stat.input';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

// todo
// add security features so not anybody can deface the website ;)

@Resolver(() => Stat)
export class StatsResolver {
  constructor(
    private statService: StatsService,
    private pubSubService: PubSubService
  ) {}

  @Query(() => [Stat])
  async stats(): Promise<Stat[]> {
    return this.statService.findLatest();
  }

  @Mutation(() => Stat)
  async createStat(
    @Args('createStatInput') createStatInput: CreateStatInput
  ): Promise<Stat> {
    return await this.statService.createStat(createStatInput);
  }

  @Subscription(() => [Stat])
  statCreated() {
    return this.pubSubService.getPubSub().asyncIterator('statCreated');
  }
}
