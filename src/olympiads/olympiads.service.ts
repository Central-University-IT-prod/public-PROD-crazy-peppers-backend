import { Injectable } from '@nestjs/common';
import { CreateOlympiadDto } from './dto/create-olympiad.dto';
//import { UpdateOlympiadDto } from './dto/update-olympiad.dto';
import mongoose from 'mongoose';
import { Olympiad } from './schema/olympiads.schema';
import { InjectModel } from '@nestjs/mongoose';
import generateRandomString from 'src/utils/generate.random.string';

@Injectable()
export class OlympiadsService {
  constructor(
    @InjectModel(Olympiad.name)
    private olympiadsModel: mongoose.Model<Olympiad>,
  ) {}

  async create(createOlympiadDto: CreateOlympiadDto, aid: string) {
    const foundOlympiad = await this.olympiadsModel.findOne({ aid });
    if (foundOlympiad) return null;
    const insertDataset = {
      ...createOlympiadDto,
      created_at: new Date().toISOString(),
      oid: generateRandomString('1234567890', 6),
      aid,
    };
    await this.olympiadsModel.create(insertDataset);
    return insertDataset;
  }

  findByAID(aid: string) {
    return this.olympiadsModel.findOne({ aid }).select('-_id');
  }

  findByOID(oid: string) {
    return this.olympiadsModel.findOne({ oid }).select('-_id');
  }

  // update(id: number, updateOlympiadDto: UpdateOlympiadDto) {
  //   return `This action updates a #${id} olympiad`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} olympiad`;
  // }
}
