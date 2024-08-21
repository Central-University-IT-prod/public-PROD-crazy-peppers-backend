import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TeamsService } from '../teams/teams.service';
import { OlympiadsService } from '../olympiads/olympiads.service';

@Injectable()
export class MetricsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
    private readonly olympiadsService: OlympiadsService,
  ) {}

  async getAll(aid: string) {
    const olympiad = await this.olympiadsService.findByAID(aid);
    const users = await this.usersService.findAll(olympiad.oid);
    const teams = await this.teamsService.findAllForAdmin();
    const registeredUsers = users.filter((user) => user.full_name !== '');
    const rolesCnts: Record<string, number> = {};
    olympiad.roles.forEach((role) => {
      rolesCnts[role.name] = 0;
    });
    registeredUsers.forEach((user) => {
      rolesCnts[user.role]++;
    });
    const tagsCnts: Record<string, number> = {};
    olympiad.tags.forEach((tag) => {
      tagsCnts[tag] = 0;
    });
    registeredUsers.forEach((user) => {
      user.tags.forEach((tag) => {
        tagsCnts[tag]++;
      });
    });
    const average_team_fill = Math.round(
      (teams.reduce((a, b) => a + b.total_members, 0) /
        teams.reduce((a, b) => a + b.want_members, 0)) *
        100,
    );
    const full_cnt = teams.reduce(
      (a, b) => (b.want_members === b.total_members ? a + 1 : a),
      0,
    );
    const users_in_team_cnt = users.reduce(
      (a, b) => (b.tid !== null ? a + 1 : a),
      0,
    );
    const dist_roles_arr = olympiad.roles.map(
      ({ name }) =>
        `    ${name}: ${Math.round((rolesCnts[name] / registeredUsers.length) * 100)}%\n`,
    );
    const dist_roles_str = dist_roles_arr.reduce((s, role) => s + role, '');
    const tags_cnts_arr = olympiad.tags.map(
      (tag) => `    ${tag}: ${tagsCnts[tag]}\n`,
    );
    const tags_cnts_ss = tags_cnts_arr.reduce((s, t) => s + t, '') + '\n';
    const registered_str = `Количество зарегистрированных пользователей: ${registeredUsers.length}/${users.length}(${Math.round((registeredUsers.length / users.length) * 100)})\n`;
    const dist_by_roles = `Распределение по ролям:\n${dist_roles_str}`;
    const tags_str = `Количество тэгов:\n${tags_cnts_ss}`;
    const average_team_fill_str = `Средняя занятость команд: ${average_team_fill}%\n`;
    const full_cnt_str = `Количество заполненных команд: ${full_cnt}/${teams.length}(${Math.round((full_cnt / teams.length) * 100)}%)\n`;
    return (
      registered_str +
      dist_by_roles +
      tags_str +
      average_team_fill_str +
      full_cnt_str
    );
  }
}
