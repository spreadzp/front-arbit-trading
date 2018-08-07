export interface Trade {
    exchange: string;
    pair: string;
    price: number;
    volume: number;
    size: number;
    origSize: number;
    remainingSize: number;
    typeOrder: string;
    idOrder: string;
    exchOrderId: string;
    time: string;
}
