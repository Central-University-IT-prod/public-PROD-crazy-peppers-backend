import { Injectable } from '@nestjs/common';
import { Admin } from './schema/admin.schema';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name)
    private adminsModel: mongoose.Model<Admin>,
  ) {}

  findOneByLogin(login: string) {
    return this.adminsModel.findOne({ login }).select('-_id');
  }

  findOneByAID(aid: string) {
    return this.adminsModel.findOne({ aid }).select('-_id');
  }
}
