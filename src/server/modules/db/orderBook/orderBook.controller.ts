import { Controller, Get, Post, Body, Param, HttpStatus, Res, Request } from '@nestjs/common';
import { OrderBookService } from './orderBook.service';
import { OrderBook } from '../../common/models/orderBook';
import { OrderBookDto } from './dto/orderBook.dto';

@Controller('orderBooks')
export class OrderBookController {
  constructor(private readonly orderBooksService: OrderBookService) {}

  @Post('create')
  async create(@Body() orderBookDto: OrderBookDto) {
    console.log('create root! :');
    this.orderBooksService.create(orderBookDto);
  }

  @Get('all')
  async findAll(): Promise<OrderBook[]> {
    const orderBooks = await this.orderBooksService.findAll();
    return orderBooks;
  }

  @Get('order-books/')
  async getOrderBookByPeriod(@Request() req: any): Promise<OrderBook[]> {
    console.log('req.query.skip', req.query.skip);
    const orderBooks = await this.orderBooksService.getOrderBookByPeriod(
      req.query.startDate, req.query.endDate, req.query.asset, +req.query.skip);
    return orderBooks;
  }

  @Post('save')
  async saveNew(data: OrderBook)  {
    const orderBooks = await this.orderBooksService.addNewData(data);
  }

  @Get('**')
  notFoundPage(@Res() res: any) {
    res.redirect('/');
  }
}