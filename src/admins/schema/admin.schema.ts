import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
  collection: 'Admins',
})
export class Admin {
  @Prop()
  aid: string;
  @Prop()
  login: string;
  @Prop()
  password: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
