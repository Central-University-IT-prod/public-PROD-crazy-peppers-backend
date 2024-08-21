import { Global, Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { Admin, AdminSchema } from 'src/admins/schema/admin.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Admin.name,
        schema: AdminSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
