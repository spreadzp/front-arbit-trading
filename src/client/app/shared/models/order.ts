export interface Order {
    exchange: string;
    pair: string;
    price: number;
    volume: number;
    size: number;
    origSize: number;
    remainingSize: number;
    typeOrder: string;
    fee: number;
    arbitrageId: string;
    exchangeId: string;
    deviationPrice: number;
    time: string;
    status: string;
    reason: string;
}
