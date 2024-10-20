import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { StatsService } from './stats.service';
import { Stat } from './stat.entity';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

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

  @Subscription(() => [Stat])
  statCreated() {
    return this.pubSubService.getPubSub().asyncIterator('statCreated');
  }
}
