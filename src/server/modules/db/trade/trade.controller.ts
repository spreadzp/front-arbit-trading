import { Controller, Get, Post, Body, Res, Request } from '@nestjs/common';
import { TradeService } from './trade.service';
import { Trade } from '../../common/models/trade';
import { TradeDto } from './dto/trade.dto';

@Controller('trades')
export class TradeController {
    constructor(private readonly tradesService: TradeService) { }

    @Post('create')
    async create(@Body() tradeDto: TradeDto) {
        console.log('create root! :');
        this.tradesService.create(tradeDto);
    }

   /*  @Get('all')
    async findAll(): Promise<Trade[]> {
        const trades = await this.tradesService.findAll();
        return trades;
    } */

    @Get('find/')
    async getTradeByPeriod(@Request() req: any): Promise<Trade[]> {
        const trades = await this.tradesService.getTradeByPeriod(req.query.startDate, req.query.endDate, req.query.asset);
        return trades;
    }

    @Get('statistic/')
    async getStatistic(@Request() req: any): Promise<any[]> {
        const trades = await this.tradesService.getTradeStatisticByPeriod (
            req.query.startDate, req.query.endDate, req.query.asset, req.query.typeOrder);
        return trades;
    }

    @Post('save')
    async saveNew(@Body() data: Trade) {
        const trade = await this.tradesService.addNewData(data);
    }

    @Get('**')
    notFoundPage(@Res() res: any) {
        res.redirect('/');
    }
}