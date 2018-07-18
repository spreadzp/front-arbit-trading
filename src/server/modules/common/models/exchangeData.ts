export interface ExchangeData {
    exchange: string;
    pair: string;
    bids: any;
    bidVolumes: any;
    asks: any;
    askVolumes: any;
    currentStatus: number;
    time: string;
    status: boolean;
    spread: number;
    host: string;
    port: number;
}
