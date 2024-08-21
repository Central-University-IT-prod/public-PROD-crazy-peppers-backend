import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
  collection: 'Invites',
})
export class Invite {
  @Prop()
  iid: string;
  /**
   * if users send to team
   * got from client:
   * "from": uid
   * "to": tid
   * parses on backend and writes as:
   * "from": uid
   * "to": captain uid
   *
   * if captain to user
   * got from client:
   * "from": captain uid
   * "to": participant uid
   * parses on backend and writes as:
   * "from": tid
   * "to": participant uid
   */
  @Prop()
  from: string;
  @Prop()
  to: string;
  @Prop()
  created_at: string;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
