import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { InvitesService } from './invites.service';
import { Request } from 'express';
import { PublicRoute } from '../auth/decorators';
import { UsersService } from '../users/users.service';
import { TeamsService } from '../teams/teams.service';

@Controller('invites')
export class InvitesController {
  constructor(
    private readonly invitesService: InvitesService,
    private readonly userService: UsersService,
    private readonly teamsService: TeamsService,
  ) {}

  @Post('as-user/:to')
  async createAsUser(@Req() request: Request, @Param('to') to: string) {
    const uid: string = request['actorId'];
    const state = await this.invitesService.createAsUser(uid, to);
    if (state) {
      return state;
    }
    throw new BadRequestException('Сообщение уже отправлено');
  }

  @Post('as-captain/:to')
  async createAsCaptain(@Req() request: Request, @Param('to') to: string) {
    const uid: string = request['actorId'];
    const state = await this.invitesService.createAsCaptain(uid, to);
    if (state) {
      return state;
    }
    throw new BadRequestException('Сообщение уже отправлено');
  }

  @Get('received')
  findAllReceived(@Req() request: Request) {
    const uid: string = request['actorId'];
    return this.invitesService.findAllReceived(uid);
  }

  @Get(':iid')
  async findOne(@Param('iid') iid: string) {
    const foundInvitation = await this.invitesService.findByIID(iid);
    if (foundInvitation) {
      return foundInvitation;
    }
    throw new NotFoundException('Приглашение не найдено');
  }

  @Patch('process/to-team/:iid')
  @PublicRoute()
  async processToTeam(
    @Param('iid') iid: string,
    @Query('action', ParseIntPipe) action: number,
  ) {
    const invite = await this.invitesService.findByIID(iid);
    if (invite === null)
      throw new NotFoundException('Не найдено такого invite');
    if (action === 1) {
      const captain = await this.userService.findOneByUID(invite.to);
      if (captain.tid === null || !captain.is_captain)
        throw new BadRequestException('Some invalid user/captain');
      const status = await this.teamsService.addMember(
        captain.tid,
        invite.from,
      );
      if (status !== null) throw new BadRequestException(status);
    }
    await this.invitesService.deleteByIID(iid);
    return this.invitesService.findAllReceived(invite.to);
  }

  @Patch('process/to-user/:iid')
  @PublicRoute()
  async processToUser(
    @Param('iid') iid: string,
    @Query('action', ParseIntPipe) action: number,
  ) {
    const invite = await this.invitesService.findByIID(iid);
    if (invite === null)
      throw new NotFoundException('Не найдено такого invite');
    if (action === 1) {
      const status = await this.teamsService.addMember(invite.from, invite.to);
      if (status !== null) throw new BadRequestException(status);
    }
    await this.invitesService.deleteByIID(iid);
    return this.invitesService.findAllReceived(invite.to);
  }

  @Delete(':iid')
  async removeOne(@Param('iid') iid: string) {
    this.invitesService.deleteByIID(iid);
  }

  // @Delete('from')
  // async removeManyByFrom(@Req() request: Request) {
  //   const uid = request['actorId'];
  //   return await this.invitesService.removeAllByFrom(uid);
  // }

  // @Delete('to')
  // async removeManyByTo(@Req() request: Request) {
  //   const uid = request['actorId'];
  //   return await this.invitesService.removeAllByTo(uid);
  // }
}
