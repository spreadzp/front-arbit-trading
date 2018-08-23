import { TradeDto } from './dto/trade.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Trade } from '../../common/models/trade';

@Injectable()
export class TradeService {
  constructor(@InjectModel('Trade') private readonly tradeModel: Model<Trade>) { }

  async create(createTradeDto: TradeDto) {
    const createdTrade = new this.tradeModel(createTradeDto);
    return await createdTrade.save();
  }

  async addNewData(data: Trade) {
    const createdTrade = await new this.tradeModel(data);
    await createdTrade.save();
  }

  /*   async findAll(): Promise<Trade[]> {
      return await this.tradeModel.find().exec();
    } */
  async getTradeStatisticByPeriod(startDate: number, endDate: number, asset: string, type: string) {
    return await this.tradeModel.aggregate([{
      $match : { $and : [ { time: { $gte: startDate, $lt: endDate }, pair: { $regex: asset, $options: 'm' }, typeOrder: type } ] },
  }, {
      $group : {
          _id : null,
          total : {
              $sum : '$volume'
          }
      }
  }]);
   /*  this.tradeModel.find({ time: { $gte: startDate, $lt: endDate }, pair: { $regex: asset, $options: 'm' }, typeOrder: type },
      {
        _id: 0, typeOrder: 1, volume: {$sum: 1}
      }
    ); */
  }

  async getTradeByPeriod(startDate: number, endDate: number, asset: string): Promise<Trade[]> {
    return await this.tradeModel.find({ time: { $gte: startDate, $lt: endDate }, pair: { $regex: asset, $options: 'm' } },
      {
        _id: 0, exchange: 1, pair: 1, price: 1, volume: 1, typeOrder: 1, arbitrageId: 1,
        exchOrderId: 1, time: 1,
      }).exec();
  }
}
