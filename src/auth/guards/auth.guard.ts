import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IS_ADMIN_KEY, IS_PUBLIC_KEY } from '../decorators';
import { Reflector } from '@nestjs/core';
import { AdminsService } from '../../admins/admins.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminsService: AdminsService,
    // private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Токен не указан');
    try {
      this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Токен не валиден');
    }
    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const { id: userId } = this.jwtService.decode(token);
    request['actorId'] = userId;
    request['isAdmin'] = false;
    if (isAdmin) {
      request['isAdmin'] = true;
      const foundAdmin = await this.adminsService.findOneByAID(userId);
      return foundAdmin !== null;
    }
    return true;
  }
}
