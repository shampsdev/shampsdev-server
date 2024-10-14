import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateStatInput {
  @Field()
  stat_id: string;

  @Field()
  name: string;

  @Field(() => Int)
  count: number;
}
