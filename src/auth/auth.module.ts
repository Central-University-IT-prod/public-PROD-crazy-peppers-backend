import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AdminsModule } from 'src/admins/admins.module';

@Module({
  imports: [UsersModule, AdminsModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
