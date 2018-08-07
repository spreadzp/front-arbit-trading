import { Document } from 'mongoose';

export interface Trade extends Document {
    exchange: string;
    pair: string;
    price: number;
    volume: number;
    size: number;
    origSize: number;
    remainingSize: number;
    typeOrder: string;
    arbitrageId: string;
    exchOrderId: string;
    time: string;
}
