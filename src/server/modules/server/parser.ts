import { Rate } from './../common/models/rate';
import { RateService } from './../db/rate/rate.service';
import { Controller } from '@nestjs/common';
import { UUID } from 'angular2-uuid';
import * as dotenv from 'dotenv';
import { Order } from './../common/models/order';
import { ExchangeData } from './../common/models/exchangeData';
import { Trade } from './../common/models/trade';
import { OrderBookService } from './../db/orderBook/orderBook.service';
import { StateTrading } from './../common/models/stateTrading';
import { ForexLoader } from './forex-loader';
import { SERVER_CONFIG } from './../../server.constants';
import { CountHelper } from './count-helper';

dotenv.config();
let responseForexResource: { responseContent: { body: number } };
let fiatPrices: [any][number];

@Controller()
export class Parser {
    exchangeData: ExchangeData[] = [];
    stateTrading: StateTrading[] = [];
    forexLoader: ForexLoader;
    countHelper: CountHelper;
    bidAskSpread: any = [];
    rate: Rate[] = [];

    constructor(
        private readonly orderBooksService: OrderBookService,
        private readonly rateService: RateService) {
        this.forexLoader = new ForexLoader();
        this.countHelper = new CountHelper();
        this.getRates();
    }

    async getRates() {
        this.rate = await this.rateService.findAll();
    }

    getForexPrices() {
        if (responseForexResource === undefined) {
            const pair = SERVER_CONFIG.forexPairs.split(',');
            responseForexResource = this.forexLoader.getNewFiatPrice([pair]);
        } else {
            if (responseForexResource.responseContent !== undefined) {
                const prices = responseForexResource.responseContent.body;
                fiatPrices = this.forexLoader.fiatParser(prices);
            }
        }
    }

    parseTcpMessage(data: any) {
        const exchangePair = data.payload.method.split(' ');
        const orderBook = data.payload.params.quote;
        const host = data.payload.params.host;
        const port = data.payload.params.port;
        return { exchangePair, orderBook, host, port };
    }

    parseSentOrder(data: any) {
        const responseOrderData = data.payload.params[0];
        if (!fiatPrices) {
            this.getForexPrices();
        }
    }

    calculateAskBid(newPrices: { exchangePair: any, orderBook: any, host: string, port: number }) {
        let currentForexPair: string, bids, asks;
        if (!fiatPrices) {
            this.getForexPrices();
        }
        if (newPrices.exchangePair[1] && fiatPrices) {
            currentForexPair = this.getPriceFiatForex(newPrices.exchangePair[1]);
            bids = this.convertToUsdPrice(currentForexPair, newPrices.orderBook.bids);
            asks = this.convertToUsdPrice(currentForexPair, newPrices.orderBook.asks);

            this.setOldStatusPrice(
                newPrices.orderBook, newPrices.exchangePair, bids, asks,
                newPrices.host, newPrices.port, currentForexPair);
        }
    }

    private setOldStatusPrice(
        orderBook: any, exchangePair: any, bidsNewOrder: any, asksNewOrder: any, hostNewOrder: string,
        portNewOrder: number, currentForexPair: any) {
        let createdExchangeField = false;
        if (!this.exchangeData && orderBook.bids !== undefined
            && orderBook.asks !== undefined) {
            this.exchangeData = [
                {
                    exchange: exchangePair[0],
                    pair: exchangePair[1],
                    bids: bidsNewOrder,
                    bidVolumes: orderBook.bids[0][1],
                    asks: asksNewOrder,
                    askVolumes: orderBook.asks[0][1],
                    currentStatus: this.getCurrentPrice().length,
                    status: true,
                    spread: 0,
                    host: hostNewOrder,
                    port: portNewOrder,
                    time: Date.now().toString(),
                },
            ];
        }
        if (bidsNewOrder && asksNewOrder) {
            for (const data of this.exchangeData) {
                if (data.exchange === exchangePair[0]
                    && data.pair === exchangePair[1]
                    && orderBook.bids !== undefined && orderBook.asks !== undefined) {
                    data.pair = exchangePair[1];
                    data.bids = bidsNewOrder;
                    data.bidVolumes = orderBook.bids[0][1];
                    data.asks = asksNewOrder;
                    data.askVolumes = orderBook.asks[0][1];
                    data.currentStatus = this.getCurrentPrice().length;
                    data.host = hostNewOrder;
                    data.port = portNewOrder;
                    data.time = Date.now().toString();
                    createdExchangeField = true;
                }
                else {
                    data.currentStatus -= 1;
                }
            }
        }
        if (!createdExchangeField && fiatPrices && exchangePair[1]) {
            bidsNewOrder = this.convertToUsdPrice(currentForexPair, orderBook.bids);
            asksNewOrder = this.convertToUsdPrice(currentForexPair, orderBook.asks);
            if (orderBook.bids !== undefined && orderBook.asks !== undefined) {
                this.exchangeData.push({
                    exchange: exchangePair[0],
                    pair: exchangePair[1],
                    bids: bidsNewOrder,
                    bidVolumes: orderBook.bids[0][1],
                    asks: asksNewOrder,
                    askVolumes: orderBook.asks[0][1],
                    currentStatus: this.getCurrentPrice().length,
                    spread: 0,
                    host: hostNewOrder,
                    port: portNewOrder,
                    time: Date.now().toString(),
                    status: true,
                });
            }
        }
        return { bidsNewOrder, asksNewOrder, hostNewOrder, portNewOrder, createdExchangeField };
    }

    private convertToUsdPrice(currentForexPair: any, currentPrice: any) {
        return (currentForexPair !== undefined) ? (currentForexPair === 'USDJPY') ?
            [[+currentPrice[0][0] / +fiatPrices[currentForexPair][0], 0]] :
            [[+currentPrice[0][0] * +fiatPrices[currentForexPair][0], 0]] :
            currentPrice;
    }

    private fromUsdToFiatPrice(exchangePair: any, currentPrice: any) {
        const currentForexPair = this.getPriceFiatForex(exchangePair);
        if (currentForexPair && fiatPrices[currentForexPair]) {
            return (currentForexPair === 'USDJPY') ?
                [[+currentPrice[0][0] * +fiatPrices[currentForexPair][0], 0]] :
                [[+currentPrice[0][0] / +fiatPrices[currentForexPair][0], 0]];
        } else {
            return currentPrice;
        }
    }

    replaceCancelledOrderByNewOrder(trade: Trade) {
        const currentOrderBooks = this.fetchOrderBook();
        let maxBuyPrise: number;
        let minSellPrise: number;
        const orders: Order[] = [];

        if (currentOrderBooks) {
            maxBuyPrise = this.getMinAsk(currentOrderBooks);
            minSellPrise = this.getMaxBid(currentOrderBooks);
        }
        const sellExchange = currentOrderBooks.find((data: any) => {
            return data.bids === minSellPrise;
        });
        const buyExchange = currentOrderBooks.find((data: any) => {
            return data.asks === maxBuyPrise;
        });
        const newExchange: ExchangeData = (trade.typeOrder === 'sell') ? sellExchange : buyExchange;
        if (this.stateTrading) {
            this.stateTrading.forEach((tradeItem, index, array) => {
                if (tradeItem.arbitrageId === trade.arbitrageId && tradeItem.typeOrder === trade.typeOrder) {
                    this.stateTrading[index].exchange = newExchange.exchange;
                    this.stateTrading[index].pair = newExchange.pair;
                    this.stateTrading[index].host = newExchange.host;
                    this.stateTrading[index].port = newExchange.port;
                }
                const order = {
                    pair: this.stateTrading[index].pair,
                    exchange: this.stateTrading[index].exchange,
                    price: this.getCurrentPriceExchange(this.stateTrading[index].exchange, this.stateTrading[index].pair,
                         this.stateTrading[index].typeOrder),
                    volume: this.stateTrading[index].volume,
                    size: this.stateTrading[index].size,
                    origSize: this.stateTrading[index].origSize,
                    remainingSize: this.stateTrading[index].remainingSize,
                    typeOrder: this.stateTrading[index].typeOrder,
                    deviationPrice: +SERVER_CONFIG.deviationPrice,
                    fee: +SERVER_CONFIG.fee,
                    exchangeId: '',
                    host: this.stateTrading[index].host,
                    port: this.stateTrading[index].port,
                    arbitrageId: this.stateTrading[index].arbitrageId,
                    time: Date.now().toString(),
                    status: 'formed',
                    reason: ''
                };
                orders.push(order);
            });
        }
        return orders;
    }

    orderFullFilled(trade: any) {
        let fullfilledOrder = false;
        let fullfilledOppositeOrder = false;
        if (this.stateTrading) {
            this.stateTrading.forEach((tradeItem, index, array) => {
                if (tradeItem.arbitrageId === trade.arbitrageId && tradeItem.typeOrder === trade.typeOrder) {
                    if (this.stateTrading[index].remainingSize === 0) {
                        fullfilledOrder = true;
                    }
                }
                if (tradeItem.arbitrageId === trade.arbitrageId && tradeItem.typeOrder !== trade.typeOrder) {
                    if (this.stateTrading[index].remainingSize === 0) {
                        fullfilledOppositeOrder = true;
                    }
                }
            });
        }
        if (fullfilledOrder && fullfilledOppositeOrder) {
            this.stateTrading = this.stateTrading.filter((currentTrade: StateTrading) => {
                if (currentTrade.remainingSize !== 0) {
                    return currentTrade;
                }
            });
        }
        return fullfilledOrder && fullfilledOppositeOrder;

    }

    subTradedVolume(trade: any) {
        if (this.stateTrading) {
            this.stateTrading.forEach((tradeItem, index, array) => {
                if (tradeItem.typeOrder === trade.typeOrder && tradeItem.arbitrageId === trade.arbitrageId
                    && this.stateTrading[index].remainingSize >= +trade.size) {
                    this.stateTrading[index].percentFullFilled += +trade.size / this.stateTrading[index].volume;
                    this.stateTrading[index].remainingSize -= +trade.size;
                }
            });
        }

    }

    setStatusTrade(order: Order) {
        let newOrderFlag = true;
        const newOrder: StateTrading = {
            exchange: order.exchange,
            pair: order.pair,
            typeOrder: order.typeOrder,
            volume: order.volume,
            size: order.size,
            origSize: order.origSize,
            remainingSize: order.remainingSize,
            percentFullFilled: 0,
            arbitrageId: order.arbitrageId,
            host: order.host,
            port: order.port,
        };
        if (this.stateTrading) {
            for (const tradeItem of this.stateTrading) {
                if (tradeItem.exchange === order.exchange
                    && tradeItem.pair === order.pair
                    && tradeItem.typeOrder === order.typeOrder
                ) {
                    // tradeItem.canTrade = false;
                    newOrderFlag = false;
                }
            }
            if (newOrderFlag) {
                this.stateTrading.push(newOrder);
            }
        } else {
            this.stateTrading.push(newOrder);
        }
    }

    getPriceFiatForex(fiat: string) {
        if (fiatPrices) {
            const assetFiat = fiat.split('-');
            if (assetFiat[1] !== 'USD') {
                const key = Object.keys(fiatPrices);
                const searchFiat = key.find((element) => {
                    return element.includes(assetFiat[1]);
                });
                return searchFiat;
            }
        }
    }

    addNewOrderBookData(): ExchangeData[] {
        if (this.exchangeData) {
            const currentOrderBooks = this.fetchOrderBook();
            if (currentOrderBooks) {
                for (const iterator of currentOrderBooks) {
                    if (iterator.bids !== 0 && iterator.asks !== 0) {
                        const newOrderBookData: any = {
                            exchangeName: iterator.exchange, pair: iterator.pair,
                            bid: iterator.bids, bidVolume: iterator.bidVolumes, ask: iterator.asks,
                            askVolume: iterator.askVolumes, time: Date.now(),
                        };
                        this.orderBooksService.addNewData(newOrderBookData);
                    }
                }
                return currentOrderBooks;
            }
        }
    }

    fetchOrderBook(): ExchangeData[] {
        return this.exchangeData.map(data => ({
            exchange: data.exchange, pair: data.pair,
            bids: data.bids[0][0], bidVolumes: data.bids[0][1], asks: data.asks[0][0], askVolumes: data.asks[0][1], time: Date.now().toString(),
            currentStatus: data.currentStatus, host: data.host, port: data.port, status: true,
            spread: 0,
        }));
    }

    getCurrentPrice(): ExchangeData[] {
        return this.exchangeData.map(data => ({
            exchange: data.exchange, pair: data.pair, bids: data.bids[0][0], bidVolumes: data.bids[0][1], asks: data.asks[0][0],
            askVolumes: data.asks[0][1], spread: ((data.asks[0][0] / data.bids[0][0]) - 1) * 100, currentStatus: data.currentStatus,
            status: data.currentStatus > 0, host: data.host, port: data.port, time: Date.now().toString(),
        }));
    }

    getBidAskSpread() {
        const bidAskSpread = [];
        const askBidSpread = [];
        for (let i = 0; i < this.exchangeData.length; i++) {
            for (let j = i + 1; j < this.exchangeData.length; j++) {
                const bidFeeExchange = this.rate.find(exchBid => exchBid.exchangeName === this.exchangeData[i].exchange).makerFee;
                const askFeeExchange = this.rate.find(exchAsk => exchAsk.exchangeName === this.exchangeData[j].exchange).makerFee;
                const coeffBidFee = 1 + bidFeeExchange / 100;
                const coeffAskFee = 1 - askFeeExchange / 100;
                const currentExchangeBidAskSpread = {
                    compareExchanges: `${this.exchangeData[i].exchange}-bid/${this.exchangeData[j].exchange}-ask`,
                    pair: `${this.exchangeData[i].pair}/${this.exchangeData[j].pair}`,
                    spread: (this.exchangeData[i].bids[0][0] * coeffBidFee - this.exchangeData[j].asks[0][0] * coeffAskFee)
                        / this.exchangeData[j].asks[0][0] * coeffAskFee
                };
                bidAskSpread.push(currentExchangeBidAskSpread);
                const currentExchangeSpread = {
                    compareExchanges: `${this.exchangeData[i].exchange}-ask/${this.exchangeData[j].exchange}-bid`,
                    pair: `${this.exchangeData[i].pair}/${this.exchangeData[j].pair}`,
                    spread: (this.exchangeData[i].asks[0][0] * coeffAskFee - this.exchangeData[j].bids[0][0] * coeffBidFee)
                        / this.exchangeData[j].bids[0][0] * coeffBidFee
                };
                askBidSpread.push(currentExchangeSpread);
            }
        }
        bidAskSpread.sort((a, b) => {
            return b.spread - a.spread;
        });
        askBidSpread.sort((a, b) => {
            return b.spread - a.spread;
        });

        return { bidAsk: bidAskSpread, askBid: askBidSpread };
    }

    getCurrentFiatPrice(): ExchangeData[] {
        return this.exchangeData.map(data => ({
            exchange: data.exchange, pair: data.pair, bids: this.fromUsdToFiatPrice(data.pair, data.bids), bidVolumes: data.bids[0][1],
            asks: this.fromUsdToFiatPrice(data.pair, data.asks), askVolumes: data.asks[0][1],
            spread: ((data.asks[0][0] / data.bids[0][0]) - 1) * 100, currentStatus: data.currentStatus,
            status: data.currentStatus > 0, host: data.host, port: data.port, time: Date.now().toString(),
        }));
    }

    defineCurrentForexPair(cryptoPair: string) {
        return this.getPriceFiatForex(cryptoPair);
    }

    getCurrentPriceExchange(exchange: string, pair: string, typeTrade: string) {
        const exchangeItem = this.getCurrentFiatPrice().filter((exchangeData: ExchangeData) => {
            if (exchangeData.exchange === exchange && exchangeData.pair === pair) {
                return exchangeData;
            }
        });
        if (exchangeItem && typeTrade === 'sell') {
            return exchangeItem[0].bids[0][0];
        }
        if (exchangeItem && typeTrade === 'buy') {
            return exchangeItem[0].asks[0][0];
        }
    }

    makePartialOrder(partialTrade: any) {
        const partialOrder: any[] = [];
        let tradeVolume: number;
        // const orderType = (partialTrade.typeOrder === 'sell') ? 'buy' : 'sell';
        const partialStartOrder = this.stateTrading.find((currentTrade) => {
            return currentTrade.arbitrageId === partialTrade.arbitrageId && currentTrade.typeOrder === partialTrade.typeOrder;
        });
        console.log('partialStartOrder  : ', partialStartOrder);
        let nextTrade: StateTrading;
        if (partialStartOrder) {
            for (const trade of this.stateTrading) {
                if (trade.arbitrageId === partialTrade.arbitrageId && trade.typeOrder !== partialTrade.typeOrder
                    && trade.remainingSize > partialStartOrder.remainingSize) {
                    tradeVolume = (trade.remainingSize - partialStartOrder.remainingSize);
                    nextTrade = trade;
                    nextTrade.typeOrder = (partialTrade.typeOrder === 'sell') ? 'buy' : 'sell';
                } else if (trade.arbitrageId === partialTrade.arbitrageId
                    && trade.typeOrder === partialStartOrder.typeOrder
                    && partialStartOrder.remainingSize <= trade.remainingSize) {
                    tradeVolume = trade.remainingSize - partialStartOrder.remainingSize;
                    nextTrade = trade;
                    nextTrade.typeOrder = partialTrade.typeOrder;
                }
                else if (trade.remainingSize === partialStartOrder.remainingSize
                    && trade.arbitrageId === partialTrade.arbitrageId && trade.typeOrder === partialTrade.typeOrder
                    && partialStartOrder.remainingSize < 1 && partialStartOrder.remainingSize > 0) {
                    nextTrade = partialStartOrder;
                    tradeVolume = partialStartOrder.origSize - partialStartOrder.remainingSize;
                    nextTrade.typeOrder = partialTrade.typeOrder;
                }
            }
        }

        console.log('nextTrade :', nextTrade);
        if (nextTrade) {
            const order = {
                pair: nextTrade.pair,
                exchange: nextTrade.exchange,
                price: this.getCurrentPriceExchange(nextTrade.exchange, nextTrade.pair, nextTrade.typeOrder),
                volume: tradeVolume,
                size: tradeVolume,
                origSize: nextTrade.volume,
                remainingSize: nextTrade.remainingSize,
                typeOrder: nextTrade.typeOrder,
                deviationPrice: +SERVER_CONFIG.deviationPrice,
                fee: +SERVER_CONFIG.fee,
                host: nextTrade.host,
                port: nextTrade.port,
                arbitrageId: partialTrade.arbitrageId,
                time: Date.now().toString(),
                statusOrder: 'formed'
            };
            partialOrder.push(order);
        }

        // console.log('partialTrade=', partialTrade, 'oppositePartialOrder=', partialOrder);
        return partialOrder;
    }

    definePriceByForex(pair: string, price: number) {
        return (pair !== undefined) ? (pair === 'USDJPY') ?
            price * +fiatPrices[pair][0] :
            price / +fiatPrices[pair][0] :
            price;
    }

    defineSellBuy(result: ExchangeData[]) {
        let ordersBot: Order[];
        let maxBuyPrise: number;
        let minSellPrise: number;
        let rateSeller: number;
        let rateBuyer: number
        if (result) {
            maxBuyPrise = this.getMinAsk(result);
            minSellPrise = this.getMaxBid(result);
        }
        const sellExchange = result.find((data: any) => {
            return data.bids === minSellPrise;
        });
        const buyExchange = result.find((data: any) => {
            return data.asks === maxBuyPrise;
        });
        if (sellExchange && buyExchange) {
            const rateS = this.rate.find(rate => rate.exchangeName === sellExchange.exchange);
            const rateB = this.rate.find(rate => rate.exchangeName === buyExchange.exchange);
            if (rateS && rateB) {
                rateSeller = rateS.makerFee;
                rateBuyer =  rateB.makerFee;
            }
            const marketSpread = (minSellPrise * (1 - rateSeller / 100) / maxBuyPrise * (1 + rateBuyer / 100) - 1) * 100;
            if (marketSpread > +SERVER_CONFIG.percentProfit) {
                const buyForexPair: string = this.defineCurrentForexPair(buyExchange.pair);
                const buyPrice = this.definePriceByForex(buyForexPair, maxBuyPrise);
                const sellForexPair = this.defineCurrentForexPair(sellExchange.pair);
                const sellPrice = this.definePriceByForex(sellForexPair, minSellPrise);
                const arbitrageUnicId = UUID.UUID();
                const sellerOrder: any = {
                    pair: sellExchange.pair,
                    exchange: sellExchange.exchange,
                    price: sellPrice,
                    volume: Number(SERVER_CONFIG.tradeVolume),
                    size: Number(SERVER_CONFIG.tradeVolume),
                    origSize: Number(SERVER_CONFIG.tradeVolume),
                    remainingSize: Number(SERVER_CONFIG.tradeVolume),
                    typeOrder: 'sell',
                    fee: +SERVER_CONFIG.fee,
                    deviationPrice: +SERVER_CONFIG.deviationPrice,
                    host: sellExchange.host,
                    port: sellExchange.port,
                    arbitrageId: arbitrageUnicId,
                    time: Date.now().toString(),
                    statusOrder: 'formed'
                };
                const buyerOrder: any = {
                    pair: buyExchange.pair,
                    exchange: buyExchange.exchange,
                    price: buyPrice,
                    volume: Number(SERVER_CONFIG.tradeVolume),
                    size: Number(SERVER_CONFIG.tradeVolume),
                    origSize: Number(SERVER_CONFIG.tradeVolume),
                    remainingSize: Number(SERVER_CONFIG.tradeVolume),
                    typeOrder: 'buy',
                    fee: +SERVER_CONFIG.fee,
                    deviationPrice: +SERVER_CONFIG.deviationPrice,
                    host: buyExchange.host,
                    port: buyExchange.port,
                    arbitrageId: arbitrageUnicId,
                    time: Date.now().toString(),
                    statusOrder: 'formed'
                };
                ordersBot = this.setOrdersForTrade(sellerOrder, buyerOrder, sellExchange, marketSpread, buyExchange);
            }
        }
        return ordersBot;
    }

    private setOrdersForTrade(
        sellerOrder: Order, buyerOrder: Order,
        sellExchange: any, marketSpread: number, buyExchange: any): Order[] {
        const ordersBot: Order[] = [];
        if (sellerOrder && buyerOrder) {
            this.setStatusTrade(sellerOrder);
            this.setStatusTrade(buyerOrder);
        }
        ordersBot.push(sellerOrder);
        console.log(`pair ${sellExchange.pair} sell: ${sellerOrder.exchange} ${sellerOrder.price}
              spread: ${marketSpread}%`);
        return ordersBot;
    }

    parseTrades(newTrades: any): Trade[] {
        const trades: Trade[] = [];
        const tradedOrders = newTrades.payload.params[0];
        const host = newTrades.payload.params[1];
        const port = newTrades.payload.params[2];
        if (tradedOrders) {
            for (const trade of tradedOrders) {
                trades.push(trade);
            }
        }
        return trades;
    }

    getMaxBid(arr: any) {
        let len = arr.length, max = -Infinity;
        while (len--) {
            if (Number(arr[len].bids) > max) {
                max = Number(arr[len].bids);
            }
        }
        return max;
    }

    getMinAsk(arr: any) {
        let len = arr.length, min = Infinity;
        while (len--) {
            if (Number(arr[len].asks) < min) {
                min = Number(arr[len].asks);
            }
        }
        return min;
    }
}
