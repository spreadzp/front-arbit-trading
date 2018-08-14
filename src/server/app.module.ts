import { MongooseModule } from '@nestjs/mongoose';
import { TradeModule } from './modules/db/trade/trade.module';
import { OrderModule } from './modules/db/order/order.module';
import { ServerTcpModule } from './modules/server/server.module';
import { OrderBookModule } from './modules/db/orderBook/orderBook.module';
import {RateModule} from './modules/db/rate/rate.module';
// nest
import { Module } from '@nestjs/common';

// modules
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { AngularUniversalModule } from './modules/angular-universal/angular-universal.module';
import { GraphqlModule } from './modules/graphql/graphql.module';
import { SERVER_CONFIG } from './server.constants';
@Module({
  imports: [
    MongooseModule.forRoot(SERVER_CONFIG.db),
    OrderBookModule,
    ServerTcpModule,
    OrderModule,
    TradeModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    RateModule,
    // GraphqlModule,
    AngularUniversalModule.forRoot()
  ],
  controllers: [],
  providers: [],
})
export class ApplicationModule { }
