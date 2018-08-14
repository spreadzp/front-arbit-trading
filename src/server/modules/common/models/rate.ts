import { Document } from 'mongoose';

export interface Rate extends Document {
    readonly exchangeName: string;
    readonly makerFee: number;
    readonly takerFee: number;
}
