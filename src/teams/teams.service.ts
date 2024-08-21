import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './schema/teams.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UsersService } from 'src/users/users.service';
import generateRandomString from 'src/utils/generate.random.string';
import { OlympiadsService } from 'src/olympiads/olympiads.service';
import { ObjectPick } from '../utils/object.pick';
import { User } from '../users/schema/users.schema';
import { TagsComp } from '../utils/tags.comp';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name)
    private teamsModel: mongoose.Model<Team>,
    private readonly usersService: UsersService,
    private readonly olympiadService: OlympiadsService,
  ) {}

  async create(creatorUID: string, createTeamDto: CreateTeamDto) {
    const foundUser = await this.usersService.findOneByUID(creatorUID);
    // excluding user if he is team member
    console.log(foundUser);
    if (!foundUser || foundUser.tid) {
      console.log(1);
      return null;
    }
    const foundUserRole = foundUser.role;
    const foundOlympiad = await this.olympiadService.findByOID(foundUser.oid);
    // for (const olympiadRole of foundOlympiad.roles) {
    //   const sameRoleInTeamDto = createTeamDto.roles.map(role => )
    // }
    // checking participants count in team
    let teamMaxMembers = 0;
    for (const eachRole of createTeamDto.roles) {
      teamMaxMembers += eachRole.available;
    }
    if (
      teamMaxMembers > foundOlympiad.max_participants_in_team ||
      teamMaxMembers < foundOlympiad.min_participants_in_team
    ) {
      console.log(2);
      return null;
    }
    // finding captain's role matadata validation
    if (!foundOlympiad.roles.find((role) => role.name === foundUserRole))
      return null;

    // check that team has creator role as min 1
    if (
      !createTeamDto.roles.find(
        (role) => role.name === foundUserRole && role.available >= 1,
      )
    )
      return null;

    // creating team with role  setted for captain
    const tid = generateRandomString('1234567890', 8);

    const insertData: Team = {
      ...createTeamDto,
      tid,
      created_at: new Date().toISOString(),
      roles: createTeamDto.roles.map((role) => ({
        name: role.name,
        available:
          role.name === foundUserRole ? role.available - 1 : role.available,
      })),
      total_members: 1,
      is_full: false,
    };
    // updating user state for becoming team captain
    await this.usersService.updateUserByLogin(foundUser.login, {
      is_captain: true,
      tid,
    });
    return await this.teamsModel.create(insertData);
  }

  async findAllForAdmin() {
    const teams = await this.teamsModel
      .find()
      .select('tid name total_members roles tags -_id');
    return teams.map((team) => {
      const want_members =
        team.total_members +
        team.roles.reduce((cnt: number, cur_val) => cnt + cur_val.available, 0);
      return {
        tid: team.tid,
        name: team.name,
        total_members: team.total_members,
        tags: team.tags,
        want_members,
      };
    });
  }

  async findAllForMember(uid: string) {
    const foundUser = await this.usersService.findOneByUID(uid);
    if (!foundUser) return null;
    const teams = (
      await this.teamsModel
        .find({ tid: { $nin: [foundUser.tid] } })
        .select('tid name total_members roles tags -_id')
    ).filter(
      (team) =>
        team.roles.findIndex(
          (role) => role.name === foundUser.role && role.available >= 1,
        ) >= 0,
    );

    teams.sort((team1, team2) =>
      TagsComp(team1.tags, team2.tags, foundUser.tags),
    );
    return teams.map((team) => {
      const want_members =
        team.total_members +
        team.roles.reduce((cnt: number, cur_val) => cnt + cur_val.available, 0);
      return {
        tid: team.tid,
        name: team.name,
        total_members: team.total_members,
        tags: team.tags,
        want_members,
      };
    });
  }

  // for put req
  async addMember(tid: string, uid: string) {
    const team = await this.findRawOneByTID(tid);
    const user = await this.usersService.findOneByUID(uid);
    if (user.tid !== null) return 'User already have team';
    const roles = team.roles;
    const my_role_index = roles.findIndex(
      (role) => role.name === user.role && role.available >= 1,
    );
    if (my_role_index < 0) return 'No available place with user role';
    roles[my_role_index].available--;
    await this.update(tid, {
      roles,
      total_members: team.total_members + 1,
      is_full: roles.findIndex((role) => role.available >= 1) < 0,
    });
    await this.usersService.updateUserByUID(uid, { tid: tid });
    return null;
  }

  findRawOneByTID(tid: string) {
    return this.teamsModel.findOne({ tid });
  }

  async findOneByTID(tid: string) {
    const team = await this.teamsModel.findOne({ tid });
    const participants = await this.usersService.findManyInTeam(tid);
    const roles: {
      name: string;
      participant: Pick<
        User,
        'uid' | 'full_name' | 'image_id' | 'role' | 'tags' | 'login'
      > | null;
    }[] = [];
    team.roles.forEach((role) => {
      for (let i = 0; i < role.available; ++i)
        roles.push({ name: role.name, participant: null });
    });
    participants.forEach((user) => {
      roles.push({
        name: user.role,
        participant: ObjectPick(user, [
          'uid',
          'full_name',
          'image_id',
          'role',
          'tags',
          'login',
        ]),
      });
    });
    roles.sort((role1, role2) => {
      if (!role1.participant && role2.participant) return 1;
      if (role1.participant && !role2.participant) return -1;
      if (role1.name < role2.name) return -1;
      if (role1.name > role2.name) return 1;
      return 0;
    });
    return {
      ...ObjectPick(team, ['tid', 'name', 'description', 'tags']),
      roles,
    };
  }

  async update(tid: string, updateTeamDto: UpdateTeamDto) {
    await this.teamsModel.updateOne(
      {
        tid,
      },
      updateTeamDto,
    );
    return this.teamsModel
      .findOne({
        tid,
      })
      .select('-_id');
  }

  async leaveFromTeam(uid: string) {
    const foundUser = await this.usersService.findOneByUID(uid);
    const tid = foundUser.tid;
    if (!foundUser) return null;
    if (!tid) return { status: 'ok' };
    if (foundUser.is_captain) {
      const teamMembers = await this.usersService.findManyInTeam(tid);
      for (const member of teamMembers) {
        await this.usersService.updateUserByUID(member.uid, {
          tid: null,
          is_captain: false,
        });
      }
      await this.teamsModel.deleteOne({ tid });
    }

    await this.usersService.updateUserByUID(foundUser.uid, {
      tid: null,
    });

    await this.teamsModel.updateOne(
      {
        tid,
      },
      {
        $inc: {
          'roles.$[x].available': 1,
          total_members: -1,
        },
      },
      { arrayFilters: [{ 'x.name': foundUser.role }] },
    );
    return { status: 'ok' };
  }

  async kickFromTeam(captainUID: string, participantUID: string) {
    if (captainUID === participantUID) return null;
    const foundCaptain = await this.usersService.findOneByUID(captainUID);
    if (!foundCaptain || !foundCaptain.is_captain || !foundCaptain.tid)
      return null;
    const foundUser = await this.usersService.findOneByUID(participantUID);
    if (!foundUser || foundUser.tid !== foundCaptain.tid) return null;
    await this.usersService.updateUserByUID(participantUID, {
      tid: null,
    });
    await this.teamsModel.updateOne(
      {
        tid: foundCaptain.tid,
      },
      {
        $inc: {
          'roles.$[x].available': 1,
          total_members: -1,
        },
      },
      { arrayFilters: [{ 'x.name': foundUser.role }] },
    );
    return { status: 'ok' };
  }
}
