import { forwardRef, Module } from "@nestjs/common";
import { OlympiadsService } from './olympiads.service';
import { OlympiadsController } from './olympiads.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Olympiad, OlympiadSchema } from './schema/olympiads.schema';
import { AdminsModule } from 'src/admins/admins.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Olympiad.name,
        schema: OlympiadSchema,
      },
    ]),
    AdminsModule,
    UsersModule,
  ],
  controllers: [OlympiadsController],
  providers: [OlympiadsService],
  exports: [OlympiadsService],
})
export class OlympiadsModule {}
