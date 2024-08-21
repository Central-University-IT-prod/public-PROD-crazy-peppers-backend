import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { UpdateTeamDto } from './dto/update-team.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { Request } from 'express';
import { PublicRoute } from '../auth/decorators';
import { UsersService } from '../users/users.service';
import { ObjectPick } from '../utils/object.pick';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
  ) {}

  @Delete('leave')
  async leave(@Req() request: Request) {
    const uidToLeave: string = request['actorId'];
    const state = await this.teamsService.leaveFromTeam(uidToLeave);
    if (state) return state;
    throw new BadRequestException('Что то пошло не так');
  }

  @Delete('kick/:uid')
  async kick(@Param('uid') uid: string, @Req() request: Request) {
    const captainUID: string = request['actorId'];
    const state = await this.teamsService.kickFromTeam(captainUID, uid);
    if (state) return state;
    throw new BadRequestException('Что то пошло не так');
  }

  @Post()
  async create(
    @Body(ValidationPipe) createTeamDto: CreateTeamDto,
    @Req() request: Request,
  ) {
    const uid: string = request['actorId'];
    const state = await this.teamsService.create(uid, createTeamDto);
    console.log(state);
    if (!state) throw new BadRequestException('Пользователь уже в команде');
    return await this.teamsService.findOneByTID(state.tid);
  }

  @Get('users-matched')
  async findMatchedUsers(@Req() { actorId: uid }: { actorId: string }) {
    const user = await this.usersService.findOneByUID(uid);
    if (!user || !user.tid)
      throw new NotFoundException(
        'Не найден пользователь или у него нет команды',
      );
    const team = await this.teamsService.findRawOneByTID(user.tid);
    return this.usersService.findAllForCaptain(
      ObjectPick(team, ['roles', 'tags']),
    );
  }

  // @Post()
  // create(@Body() createTeamDto: CreateTeamDto, @Req() req: Request) {
  //   const login: string = req['login'];
  //   return this.teamsService.create(createTeamDto);
  // }

  @Get('matched')
  findAll(@Req() request: Request) {
    const uid: string = request['actorId'];
    return this.teamsService.findAllForMember(uid);
  }

  @Get()
  @PublicRoute()
  findAllForAdmin() {
    return this.teamsService.findAllForAdmin();
  }

  @Get('my')
  async findMy(@Req() { actorId }: { actorId: string }) {
    const user = await this.usersService.findOneByUID(actorId);
    const team = await this.teamsService.findOneByTID(user.tid);
    if (team) return team;
    throw new NotFoundException('Команда не найдена');
  }

  @PublicRoute()
  @Get(':tid')
  async findOne(@Param('tid') tid: string) {
    const team = await this.teamsService.findOneByTID(tid);
    if (team) return team;
    throw new NotFoundException('Команда не найдена');
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.teamsService.findOne(+id);
  // }

  @Patch(':tid')
  update(
    @Param('tid') tid: string,
    @Body(ValidationPipe) updateTeamDto: UpdateTeamDto,
  ) {
    const state = this.teamsService.update(tid, updateTeamDto);
    if (state) {
      return state;
    }
    throw new BadRequestException('Что то пошло не так');
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.teamsService.remove(+id);
  // }
}
