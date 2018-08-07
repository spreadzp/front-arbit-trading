export interface StateTrading {
    exchange: string;
    pair: string;
    typeOrder: string;
    arbitrageId: string;
    percentFullFilled: number;
    volume: number;
    size: number;
    origSize: number;
    remainingSize: number;
    host: string;
    port: number;
}
