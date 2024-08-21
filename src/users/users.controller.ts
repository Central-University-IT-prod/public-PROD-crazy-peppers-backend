import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { PublicRoute } from '../auth/decorators';
import { Request } from 'express';
import { ObjectPick } from '../utils/object.pick';
import { UpdateUserDto } from './dto/update-user.dto'; // import { CreateUsersDto } from './dto/create-user-with-defaults.dto';
// import { CreateUsersDto } from './dto/create-user-with-defaults.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async findProfile(@Req() request: Request) {
    const profile = await this.usersService.findOneByUID(request['actorId']);
    if (!profile) {
      throw new NotFoundException('Пользователь не найден');
    }
    return ObjectPick(profile, [
      'uid',
      'full_name',
      'image_id',
      'bio',
      'telegram',
      'tags',
      'role',
      'is_captain',
    ]);
  }

  // @Post('team/remove')

  @Patch('me')
  async updateProfile(
    @Body(new ValidationPipe({ whitelist: true })) updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    console.log(updateUserDto);
    await this.usersService.updateUserByUID(request['actorId'], updateUserDto);
    console.log(22);
    const profile = await this.usersService.findOneByUID(request['actorId'])
    console.log(profile);
    return ObjectPick(profile, [
      'uid',
      'full_name',
      'image_id',
      'bio',
      'telegram',
      'tags',
      'role',
      'is_captain',
    ]);
  }

  // @Get('get-all-for-admin')
  // async getAllForAdmin(@Req() request: Request) {
  //   const credentials: Credentials = this.jwtService.decode(
  //     extractToken(request),
  //   );
  // }
  // @Get('matched')
  // async findAllForCaptain(@Req() { actorId: uid }: { actorId: string }) {}

  @Get(':uid')
  @PublicRoute()
  async findOne(@Param('uid') uid: string) {
    const foundUser = await this.usersService.findOneByUID(uid);
    if (!foundUser) throw new NotFoundException('Пользователь не найден');
    return ObjectPick(foundUser, [
      'uid',
      'full_name',
      'image_id',
      'bio',
      'telegram',
      'tags',
      'role',
      'is_captain',
    ]);
  }
}
