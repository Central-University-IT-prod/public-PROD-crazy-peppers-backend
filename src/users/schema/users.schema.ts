import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
  collection: 'Users',
})
export class User {
  @Prop()
  uid: string;
  @Prop()
  oid: string;
  @Prop()
  tid?: string;
  @Prop()
  login: string;
  @Prop()
  password: string;
  @Prop()
  full_name: string;
  @Prop()
  bio: string;
  @Prop()
  sex: 'm' | 'f' | 'ns';
  @Prop()
  age: number;
  @Prop()
  telegram: string;
  @Prop()
  image_id: number;

  @Prop()
  is_registered: boolean;
  @Prop()
  is_captain: boolean;
  @Prop()
  role: string;
  @Prop()
  tags: string[];
  @Prop()
  invites_count: number;
  @Prop()
  bookmarks: string[];
  @Prop()
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
