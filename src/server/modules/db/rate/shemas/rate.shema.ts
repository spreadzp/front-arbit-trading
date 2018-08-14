import * as mongoose from 'mongoose';

export const RateSchema = new mongoose.Schema({
    exchangeName: String,
    makerFee: Number,
    takerFee: Number,
});
