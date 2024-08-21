//import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './schema/users.schema';
import generateRandomString from 'src/utils/generate.random.string';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
import randint from '../utils/randint';
import { ObjectPick } from '../utils/object.pick';
import { UpdateUserDto } from './dto/update-user.dto';
import { TagsComp } from '../utils/tags.comp';
import { Team } from '../teams/schema/teams.schema';

@UseGuards(AuthenticationGuard)
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: mongoose.Model<User>,
  ) {}

  async findCaptainByTID(tid: string) {
    return await this.usersModel.findOne({
      tid,
      is_captain: true,
    });
  }

  async updateUserByLogin(login: string, updateData: UpdateUserDto) {
    await this.usersModel.updateOne({ login }, updateData);
    return await this.usersModel.findOne({ login }).select('-_id -__v');
  }

  async updateUserByUID(uid: string, updateData: UpdateUserDto) {
    return this.usersModel.updateOne({ uid }, updateData);
  }

  findManyInTeam(tid: string) {
    return this.usersModel.find({ tid });
  }

  async findAllForCaptain(team: Pick<Team, 'roles' | 'tags'>) {
    const users = (
      await this.usersModel
        .find({ full_name: { $nin: [''] }, tid: null })
        .select('uid tid full_name image_id role tags login -_id')
    ).filter(
      (user) =>
        team.roles.findIndex(
          (role) => role.name === user.role && role.available >= 1,
        ) >= 0,
    );
    users.sort((user1, user2) => TagsComp(user1.tags, user2.tags, team.tags));
    return users.map((user) =>
      ObjectPick(user, [
        'uid',
        'full_name',
        'image_id',
        'role',
        'tags',
        'login',
      ]),
    );
  }

  async createAllWithDefaults(oid: string, count: number) {
    const foundUsers = await this.usersModel.find({ oid });
    if (foundUsers.length) return null;

    const createdUsers: Pick<
      User,
      | 'uid'
      | 'tags'
      | 'image_id'
      | 'full_name'
      | 'login'
      | 'role'
      | 'is_registered'
      | 'password'
    >[] = [];
    for (let i = 0; i < count; i++) {
      const defaultRegistrationData: User = {
        oid,
        login: generateRandomString('qwertyuiopasdfghjklzxcvbnm', 6),
        password: generateRandomString(
          'qwertyuiopasdfghjklzxcvbnm1234567890_+)(*&^%$#@!?><,./.;:[]}{',
          8,
        ),
        image_id: randint(0, 15),
        uid: generateRandomString('1234567890', 8),
        tid: null,
        full_name: '',
        bio: '',
        sex: 'ns',
        age: null,
        telegram: '',
        is_registered: false,
        is_captain: false,
        role: '',
        tags: [],
        invites_count: 0,
        bookmarks: [],
        created_at: new Date(),
      };

      try {
        await this.usersModel.create(defaultRegistrationData);
        createdUsers.push(
          ObjectPick(defaultRegistrationData, [
            'uid',
            'tags',
            'image_id',
            'full_name',
            'login',
            'password',
            'role',
            'is_registered',
          ]),
        );
      } catch (_error) {
        return null;
      }
    }
    return createdUsers;
  }

  async findAll(oid: string, only_registered: boolean = false) {
    const filter: { oid: string; full_name?: { $nin: ''[] } } = { oid };
    if (only_registered) filter['full_name'] = { $nin: [''] };
    return this.usersModel
      .find(filter)
      .sort({ full_name: 'desc' })
      .select('uid tags image_id full_name login role -_id');
  }

  findOneByUID(uid: string) {
    return this.usersModel.findOne({ uid }).select('-_id');
  }

  findOneByLogin(login: string) {
    return this.usersModel.findOne({ login }).select('-_id');
  }

  async addInviteMetric(uid: string) {
    await this.usersModel.updateOne({ uid }, { $inc: { invites_count: 1 } });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }
}
