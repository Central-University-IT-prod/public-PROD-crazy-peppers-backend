import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invite } from './schema/invites.schema';
import mongoose from 'mongoose';
import generateRandomString from '../utils/generate.random.string';
import { UsersService } from '../users/users.service';
import { TeamsService } from '../teams/teams.service';
import { ObjectPick } from '../utils/object.pick';
import { shortenString } from '../utils/shorten.string';
import { TagsComp } from '../utils/tags.comp';

@Injectable()
export class InvitesService {
  constructor(
    @InjectModel(Invite.name)
    private invitesModel: mongoose.Model<Invite>,
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
  ) {}

  async createAsUser(from: string, tid: string) {
    const captain = await this.usersService.findCaptainByTID(tid);
    if (!captain) return null;
    // from user to captain
    const invite = {
      from,
      to: captain.uid,
    };
    const foundInvite = await this.invitesModel.findOne(invite);
    if (foundInvite) return null;
    return await this.invitesModel.create({
      ...invite,
      iid: generateRandomString('1234567890', 12),
    });
  }

  // from will be uid
  async createAsCaptain(from: string, participantUID: string) {
    const captain = await this.usersService.findOneByUID(from);
    const tid: string = captain.tid;
    if (!tid) return null;
    // from team to user
    const invite = {
      from: tid,
      to: participantUID,
    };
    await this.usersService.addInviteMetric(participantUID);
    const foundInvite = await this.invitesModel.findOne(invite);
    if (foundInvite) return null;
    return await this.invitesModel.create({
      ...invite,
      iid: generateRandomString('1234567890', 12),
    });
  }

  async findAllReceived(to: string) {
    const invites = await this.invitesModel.find({
      to,
    });
    // iid, from, name, desc
    const maxSymbols = 100;
    const res_invites = await Promise.all(
      invites.map(async (invite) => {
        const res = ObjectPick(invite, ['iid', 'from']);
        const team = await this.teamsService.findRawOneByTID(invite.from);
        if (team !== null)
          return {
            ...res,
            tags: team.tags,
            name: team.name,
            desc: shortenString(team.description, maxSymbols),
          };
        const user = await this.usersService.findOneByUID(invite.from);
        if (user !== null)
          return {
            ...res,
            tags: user.tags,
            name: user.full_name,
            desc: shortenString(user.bio, maxSymbols),
          };
        return null;
      }),
    );
    if (res_invites.indexOf(null) >= 0) return null;
    const foundUser = await this.usersService.findOneByUID(to);
    if (foundUser === null) return null;
    const tags = foundUser.is_captain
      ? (await this.teamsService.findOneByTID(foundUser.tid)).tags
      : foundUser.tags;
    res_invites.sort((invite1, invite2) =>
      TagsComp(invite1.tags, invite2.tags, tags),
    );
    return res_invites.map((invite) =>
      ObjectPick(invite, ['iid', 'from', 'name', 'desc']),
    );
  }

  async findAllSent(from: string) {
    return await this.invitesModel.find({
      from,
    });
  }

  async findByIID(iid: string) {
    return await this.invitesModel.findOne({ iid });
  }

  async deleteByIID(iid: string) {
    await this.invitesModel.deleteOne({ iid });
    return { status: 'ok' };
  }

  // all will be used for adding member to team
  async removeAllFromTeam(tid: string) {
    await this.invitesModel.deleteMany({ from: tid });
    return { status: 'ok' };
  }

  async removeAllFromUser(uid: string) {
    await this.invitesModel.deleteMany({ from: uid });
    return { status: 'ok' };
  }

  async removeAllToUser(uid: string) {
    await this.invitesModel.deleteMany({ to: uid });
    return { status: 'ok' };
  }
}
