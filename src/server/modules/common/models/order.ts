import { Document } from 'mongoose';
export interface Order extends Document {
    readonly exchange: string;
    readonly pair: string;
    readonly price: number;
    readonly volume: number;
    readonly typeOrder: string;
    readonly fee: number;
    readonly arbitrageId: string;
    readonly exchangeId: string;
    readonly deviationPrice: number;
    readonly time: string;
    readonly host: string;
    readonly port: number;
    readonly status: string;
    readonly reason: string;
}
