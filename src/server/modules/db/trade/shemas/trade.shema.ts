import * as mongoose from 'mongoose';

export const TradeSchema = new mongoose.Schema({
    exchange: String,
    pair: String,
    price: Number,
    volume: Number,
    size: Number,
    origSize: Number,
    remainingSize: Number,
    typeOrder: String,
    arbitrageId: String,
    exchOrderId: String,
    time: String,
});
