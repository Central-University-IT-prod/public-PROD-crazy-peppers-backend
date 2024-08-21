import { Controller, Get, Req } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { UsersService } from '../users/users.service';
import { AdminRoute } from '../auth/decorators';

@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('all')
  @AdminRoute()
  async getAll(@Req() { actorId: aid }: { actorId: string }) {
    return this.metricsService.getAll(aid);
  }
}
