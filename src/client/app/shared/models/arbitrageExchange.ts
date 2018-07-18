export interface ArbitrageExchange {
    IdGroupArbitrage: string;
    exchange: string;
    pair: string;
    memberOfExchange: string;
    tradeVolume: number;
    fee: number;
    deviation: number;
    status: string;
}
