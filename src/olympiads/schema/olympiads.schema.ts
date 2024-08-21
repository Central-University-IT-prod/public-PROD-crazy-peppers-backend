import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
  collection: 'Olympiads',
})
export class Olympiad {
  @Prop()
  oid: string;
  @Prop()
  aid: string;
  @Prop()
  name: string;
  @Prop()
  max_participants_in_team: number;
  @Prop()
  min_participants_in_team: number;
  @Prop()
  roles: {
    name: string;
    max_in_team: number;
    min_in_team: number;
  }[];
  @Prop()
  tags: string[];
  @Prop()
  deadline: string;
  @Prop()
  created_at: string;
}

export const OlympiadSchema = SchemaFactory.createForClass(Olympiad);
