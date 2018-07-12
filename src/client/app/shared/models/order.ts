export interface Order {
    exchange: string;
    pair: string;
    price: number;
    volume: number;
    typeOrder: string;
    fee: number;
    arbitrageId: string;
    deviationPrice: number;
    time: string;
}
