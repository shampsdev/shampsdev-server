import { Injectable } from '@nestjs/common';
import { Stat } from './stat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStatInput } from './dto/create-stat.input';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Stat) private statsRepository: Repository<Stat>,
  ) {}

  async createStat(createStatInput: CreateStatInput): Promise<Stat> {
    const newStat = this.statsRepository.create({
      ...createStatInput,
      timestamp: new Date(),
    });

    return this.statsRepository.save(newStat);
  }

  async findLatest(): Promise<Stat[]> {
    return this.statsRepository
      .createQueryBuilder('stat')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(subStat.timestamp)', 'latestTimestamp')
          .from('stat', 'subStat')
          .where('subStat.stat_id = stat.stat_id')
          .getQuery();
        return 'stat.timestamp = (' + subQuery + ')';
      })
      .getMany();
  }

  async findAll(): Promise<Stat[]> {
    return this.statsRepository.find();
  }
}
