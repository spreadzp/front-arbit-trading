import { ratesProviders } from './rate.providers';
import { RateSchema } from './shemas/rate.shema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RateController } from './rate.controller';
import { RateService } from './rate.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Rate', schema: RateSchema }])],
  controllers: [RateController],
  providers: [RateService, ...ratesProviders],
})
export class RateModule { }
