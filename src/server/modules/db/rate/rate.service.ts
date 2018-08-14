import { RateDto } from './dto/rate.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rate } from '../../common/models/rate';

@Injectable()
export class RateService {
  constructor(@InjectModel('Rate') private readonly rateModel: Model<Rate>) {}

  async create(createRateDto: RateDto) {
    const createdRate = new this.rateModel(createRateDto);
    return await createdRate.save();
  }

  async addNewData(data: Rate) {
    const createdRate = new this.rateModel(data);
    await createdRate.save();
  }

  async deleteRate(data: Rate) {
    const rate = await new this.rateModel(data);
    console.log('rate :', rate);
    await rate.remove();
  }

  async findAll() {
    return await this.rateModel.find().exec();
  }
}
