import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Stat {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  stat_id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  count: number;

  @Column()
  @Field(() => Date)
  timestamp: Date;
}
