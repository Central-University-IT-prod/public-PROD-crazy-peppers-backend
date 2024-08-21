import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { OlympiadsService } from './olympiads.service';
import { CreateOlympiadDto } from './dto/create-olympiad.dto';
import { AdminsService } from 'src/admins/admins.service';
import { Request } from 'express';
import { AdminRoute, PublicRoute } from '../auth/decorators';
import { UsersService } from '../users/users.service';

@Controller('olympiads')
export class OlympiadsController {
  constructor(
    private readonly olympiadsService: OlympiadsService,
    private readonly usersService: UsersService,
    private readonly adminsService: AdminsService,
  ) {}

  @Post('create')
  @AdminRoute()
  async create(
    @Body(ValidationPipe) createOlympiadDto: CreateOlympiadDto,
    @Req() request: Request,
  ) {
    const aid: string = request['actorId'];
    const status = await this.olympiadsService.create(createOlympiadDto, aid);
    if (status) return status;
    throw new BadRequestException('Олимпиада уже зарегистрирована');
  }

  @Get('my')
  async find(@Req() request: Request) {
    const olympiad_by_admin = await this.olympiadsService.findByAID(
      request['actorId'],
    );
    if (olympiad_by_admin) return olympiad_by_admin;
    const foundUser = await this.usersService.findOneByUID(request['actorId']);
    if (foundUser) {
      const olympiad = await this.olympiadsService.findByOID(foundUser.oid);
      if (olympiad) return olympiad;
    }
    throw new NotFoundException('Олимпиада не найдена');
  }

  @Get('users')
  @AdminRoute()
  async findAll(@Req() { actorId: aid }: { actorId: string }) {
    console.log(aid);
    console.log(11);
    const foundOlympiad = await this.olympiadsService.findByAID(aid);
    console.log(foundOlympiad);
    if (!foundOlympiad) throw new NotFoundException('Олимпиада не найдена');
    return await this.usersService.findAll(foundOlympiad.oid, false);
  }

  @Get(':oid')
  @PublicRoute()
  async getByOID(@Param('oid') oid: string) {
    const olympiad = await this.olympiadsService.findByOID(oid);
    if (olympiad) return olympiad;
    throw new NotFoundException('Олимпиада не найдена');
  }

  @Post('fill/:count')
  @AdminRoute()
  async createAllWithDefaults(
    @Param('count', ParseIntPipe) count: number,
    @Req() { actorId: aid }: { actorId: string },
  ) {
    const olympiad = await this.olympiadsService.findByAID(aid);
    if (olympiad === null) return null;
    const state = await this.usersService.createAllWithDefaults(
      olympiad.oid,
      count,
    );
    if (state) return state;
    throw new BadRequestException('Кажется что то пошло не так');
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateOlympiadDto: UpdateOlympiadDto,
  // ) {
  //   return this.olympiadsService.update(+id, updateOlympiadDto);
  // }
}
