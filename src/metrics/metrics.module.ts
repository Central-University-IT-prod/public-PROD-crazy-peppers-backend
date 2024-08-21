import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { UsersModule } from '../users/users.module';
import { TeamsModule } from '../teams/teams.module';
import { MetricsService } from './metrics.service';
import { OlympiadsModule } from '../olympiads/olympiads.module';

@Module({
  imports: [UsersModule, TeamsModule, OlympiadsModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
