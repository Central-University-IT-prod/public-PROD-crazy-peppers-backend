import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
  collection: 'Teams',
})
export class Team {
  @Prop()
  tid: string;
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  roles: {
    name: string;
    available: number;
  }[];
  @Prop()
  total_members: number;
  @Prop()
  is_full: boolean;
  @Prop()
  tags: string[];
  @Prop()
  created_at: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
