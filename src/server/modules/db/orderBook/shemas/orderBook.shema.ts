import * as mongoose from 'mongoose';

export const OrderBookSchema = new mongoose.Schema({
    exchangeName: String,
    pair: String,
    bid: Number,
    bidVolume: Number,
    ask: Number,
    askVolume: Number,
    time: String,
});
