import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsResolver } from './stats.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stat } from './stat.entity';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stat])],
  providers: [StatsService, StatsResolver, PubSubService],
  exports: [StatsService]
})
export class StatsModule {}
