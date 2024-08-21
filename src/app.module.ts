import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { parseEnvironment } from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { GlobalJwtModule } from './jwt/jwt.module';
import { AdminsModule } from './admins/admins.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OlympiadsModule } from './olympiads/olympiads.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './auth/guards/auth.guard';
import { InvitesModule } from './invites/invites.module';
import { TeamsModule } from './teams/teams.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [parseEnvironment],
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    GlobalJwtModule,
    AuthModule,
    UsersModule,
    AdminsModule,
    OlympiadsModule,
    InvitesModule,
    TeamsModule,
    MetricsModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
