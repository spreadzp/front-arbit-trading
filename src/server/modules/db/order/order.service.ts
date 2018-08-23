import { OrderSchema } from './shemas/order.shema';
import { OrderDto } from './dto/order.dto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './../../common/models/order';
import * as mongoose from 'mongoose';

@Injectable()
export class OrderService {
  constructor(@InjectModel('Order') private readonly orderModel: Model<Order>) { }

  async create(createOrderDto: OrderDto) {
    const createdOrder = new this.orderModel(createOrderDto);
    return await createdOrder.save();
  }

  async addNewOrder(data: Order) {
    const createdOrder = await new this.orderModel(data);
    await createdOrder.save();
  }

  async updateStatusOrder(arbitOrderId: string, typeUpdateOrder: string, exchangeOrderId: string, statusOrder: string, reasonRejected: string) {
    await this.orderModel.updateOne({ arbitrageId: arbitOrderId, typeOrder: typeUpdateOrder }, {
      $set: {
        exchangeId: exchangeOrderId, status: statusOrder, reason: reasonRejected,
      }
    });
  }

  async findOrderById(arbitValueId: string, typeOppositeOrder: string): Promise<Order> {
    return await this.orderModel.findOne({arbitrageId: arbitValueId, typeOrder: typeOppositeOrder});
  }

  async getOrderByPeriod(startDate: number, endDate: number, asset: string): Promise<Order[]> {
    return await this.orderModel.find({ time: { $gte: startDate, $lt: endDate }, pair: { $regex: asset, $options: 'm' } },
      {
        _id: 0, exchange: 1, pair: 1, price: 1, size: 1, typeOrder: 1, statusOrder: 1, fee: 1,
        arbitrageId: 1, exchangeId: 1, deviationPrice: 1, time: 1, status: 1, reason: 1
      }).exec();
  }
}
