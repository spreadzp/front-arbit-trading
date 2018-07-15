import { Order } from './../../../common/models/order';


export class OrderDto {
    readonly exchange: string;
    readonly pair: string;
    readonly price: number;
    readonly volume: number;
    readonly typeOrder: string;
    readonly fee: number;
    readonly deviationPrice: number;
    readonly arbitrageId: string;
    readonly time: string;
    readonly host: string;
    readonly port: number;
  }
