export class TradeDto {
    readonly exchange: string;
    readonly pair: string;
    readonly price: number;
    readonly volume: number;
    readonly size: number;
    readonly origSize: number;
    readonly remainingSize: number;
    readonly typeOrder: string;
    readonly arbitrageId: string;
    readonly exchOrderId: string;
    readonly time: string;
  }
