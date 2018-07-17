import { OrderSchema } from './shemas/order.shema';
import { Controller, Get, Post, Body, Res, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from '../../common/models/order';
import { OrderDto } from './dto/order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly ordersService: OrderService) { }

  @Post('create')
  async create(@Body() orderDto: OrderDto) {
    console.log('create root! :');
    this.ordersService.create(orderDto);
  }

  @Get('all')
  async findAll(): Promise<Order[]> {
    const orders = await this.ordersService.findAll();
    return orders;
  }

  @Get('find/')
  async getOrderByPeriod(@Request() req: any): Promise<Order[]> {
    const orders = await this.ordersService.getOrderByPeriod(req.query.startDate, req.query.endDate);
    return orders;
  }

  @Post('save')
  async saveNew(@Body() data: Order) {
    const order = await this.ordersService.addNewData(data);
  }

  @Get('**')
  notFoundPage(@Res() res: any) {
    res.redirect('/');
  }
}