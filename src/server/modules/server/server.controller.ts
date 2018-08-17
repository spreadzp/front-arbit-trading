import { OrderBookService } from './../db/orderBook/orderBook.service';
import { ServerTcpBot } from './server-tcp';
import { Controller, Get, Post, Body, Param, HttpStatus, Res } from '@nestjs/common';
import { OrderService } from './../db/order/order.service';
import { TradeService } from './../db/trade/trade.service';

@Controller('sever-tcp')
export class ServerTcpController {
    serverTcp: ServerTcpBot;

    constructor(
        private readonly orderBooksService: OrderBookService,
        private readonly orderService: OrderService,
        private readonly tradeService: TradeService,
    ) {
        this.serverTcp = new ServerTcpBot(this.orderBooksService, this.orderService, this.tradeService );
    }

    @Get('start-server')
    startTcpServer() {
        this.serverTcp.createTcpServer();
    }

    @Get('stop-server')
    stopTcpServer() {
        this.serverTcp.stopTcpServer();
    }

    @Get('current-price')
    userBalance(@Res() res: any) {
        const currentPrice = this.serverTcp.getCurrentPrice();
        res.status(HttpStatus.OK).json(currentPrice);
    }

    @Get('current-spread')
    currentSpread(@Res() res: any) {
        const currentSpread = this.serverTcp.getSpread();
        res.status(HttpStatus.OK).json(currentSpread);
    }
}
