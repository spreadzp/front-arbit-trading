import { Controller, Get, Post, Body, Param, HttpStatus, Res, Request, Delete } from '@nestjs/common';
import { RateService } from './rate.service';
import { Rate } from '../../common/models/rate';
import { RateDto } from './dto/rate.dto';

@Controller('rates')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Post('create')
  async create(@Body() rateDto: RateDto) {
    console.log('create root! :');
    this.rateService.create(rateDto);
  }

  @Get('all')
  async findAll(): Promise<Rate[]> {
    const rates = await this.rateService.findAll();
    return rates;
  }

  @Post('save')
  async saveNewRate(@Body() data: Rate)  {
    const rates = await this.rateService.addNewData(data);
  }

  @Post('delete')
  async deleteRate(@Body() data: Rate)  {
    console.log('data :', data);
    await this.rateService.deleteRate(data);
  }

  @Get('**')
  notFoundPage(@Res() res: any) {
    res.redirect('/');
  }
}