import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsResolver } from './stats.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stat } from './stat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stat])],
  providers: [StatsService, StatsResolver],
})
export class StatsModule {}
