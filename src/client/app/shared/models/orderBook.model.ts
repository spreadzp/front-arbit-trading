import { Document } from 'mongoose';

export class OrderBook extends Document {
    readonly exchangeName: string;
    readonly pair: string;
    readonly bid: number;
    readonly bidVolume: number;
    readonly ask: number;
    readonly askVolume: number;
    readonly time: string;
}
