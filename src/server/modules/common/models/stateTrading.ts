export interface StateTrading {
    exchange: string;
    pair: string;
    typeOrder: string;
    arbitrageId: string;
    percentFullFilled: number;
    volume: number;
    canTrade: boolean;
    host: string;
    port: number;
}
