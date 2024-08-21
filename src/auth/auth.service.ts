import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminsService } from 'src/admins/admins.service';
import { UsersService } from 'src/users/users.service';

export type Credentials = {
  login: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private adminsService: AdminsService,
  ) {}

  async auth(token: string) {
    try {
      this.jwtService.verify(token);
    } catch (_error) {
      return null;
    }
  }

  async login(credentials: Credentials) {
    const foundUser = await this.usersService.findOneByLogin(credentials.login);
    const foundAdmin = await this.adminsService.findOneByLogin(
      credentials.login,
    );
    if (foundUser) {
      if (foundUser.password === credentials.password) {
        return {
          token: this.jwtService.sign({ id: foundUser.uid }),
          is_admin: false,
        };
      }
      return null;
    }
    if (foundAdmin) {
      if (foundAdmin.password === credentials.password) {
        return {
          token: this.jwtService.sign({ id: foundAdmin.aid }),
          is_admin: true,
        };
      }
      return null;
    }
    return null;
  }
}
