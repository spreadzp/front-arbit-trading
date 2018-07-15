import { Document } from 'mongoose';

export interface OrderBook extends Document {
    readonly exchangeName: string;
    readonly pair: string;
    readonly bid: number;
    readonly ask: number;
    readonly time: number;
}
