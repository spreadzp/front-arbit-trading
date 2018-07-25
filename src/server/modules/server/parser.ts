
import { Controller } from '@nestjs/common';
import { UUID } from 'angular2-uuid';
import * as dotenv from 'dotenv';
import { Order } from './../common/models/order';
import { ExchangeData } from './../common/models/exchangeData';
import { Trade } from './../common/models/trade';
import { OrderBookService } from './../db/orderBook/orderBook.service';
import { StateTrading } from './../common/models/stateTrading';
const emoji = require('node-emoji');
import { ForexLoader } from './forex-loader';
import { SERVER_CONFIG } from './../../server.constants';
dotenv.config();

let result;
let responseForexResource: { responseContent: { body: number } };
let fiatPrices: [any][number];
let connectedExhanges;
let currentBalance = 0;
let currentVolume = 0;

@Controller()
export class Parser {
    exchangeData: ExchangeData[] = [];
    stateTrading: StateTrading[] = [];
    forexLoader: ForexLoader;
    constructor(private readonly orderBooksService: OrderBookService) {
        this.forexLoader = new ForexLoader();
    }
    getForexPrices() {
        if (responseForexResource === undefined) {
            const pair = SERVER_CONFIG.forexPairs.split(',');
            responseForexResource = this.forexLoader.getNewFiatPrice([pair]);
        } else {
            if (responseForexResource.responseContent !== undefined) {
                const prices = responseForexResource.responseContent.body;
                //console.log('prices :', prices);
                fiatPrices = this.forexLoader.fiatParser(prices);
            }
        }
    }
    parseTcpMessage(data: any) {
        const exchangePair = data.payload.method.split(' ');
        const orderBook = data.payload.params[0];
        const host = data.payload.params[1];
        const port = data.payload.params[2];
        return { exchangePair, orderBook, host, port };
    }
    parseSentOrder(data: any) {
        const responseOrderData = data.payload.params[0];
        this.defineStateBalance(responseOrderData);
    }
    calculateAskBid(newPrices: { exchangePair: any, orderBook: any, host: string, port: number }) {
        let currentForexPair: string, bids, asks;
        if (!fiatPrices) {
            this.getForexPrices();
        }
        if (newPrices.exchangePair[1] && fiatPrices) {
            currentForexPair = this.getPriceFiatForex(newPrices.exchangePair[1]);
            bids = (currentForexPair !== undefined) ? (currentForexPair === 'USDJPY') ?
                [[+newPrices.orderBook.bids[0][0] / +fiatPrices[currentForexPair][0], 0]] :
                [[+newPrices.orderBook.bids[0][0] * +fiatPrices[currentForexPair][0], 0]] :
                newPrices.orderBook.bids;

            asks = (currentForexPair !== undefined) ? (currentForexPair === 'USDJPY') ?
                [[+newPrices.orderBook.asks[0][0] / +fiatPrices[currentForexPair][0], 0]] :
                [[+newPrices.orderBook.asks[0][0] * +fiatPrices[currentForexPair][0], 0]] :
                newPrices.orderBook.asks;

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
                    currentStatus: 4,
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
                    data.currentStatus = 4;
                    data.host = hostNewOrder;
                    data.port = portNewOrder;
                    data.time = Date.now().toString(),
                        createdExchangeField = true;
                }
                else {
                    data.currentStatus -= 1;
                }
            }
        }
        if (!createdExchangeField && fiatPrices && exchangePair[1]) {
            bidsNewOrder = (currentForexPair !== undefined) ? (currentForexPair === 'USDJPY') ?
                [[+orderBook.bids[0][0] / +fiatPrices[currentForexPair][0], 0]] :
                [[+orderBook.bids[0][0] * +fiatPrices[currentForexPair][0], 0]] :
                orderBook.bids;
            asksNewOrder = (currentForexPair !== undefined) ? (currentForexPair === 'USDJPY') ?
                [[+orderBook.asks[0][0] / +fiatPrices[currentForexPair][0], 0]] :
                [[+orderBook.asks[0][0] * +fiatPrices[currentForexPair][0], 0]] :
                orderBook.asks;
            if (orderBook.bids !== undefined && orderBook.asks !== undefined) {
                this.exchangeData.push({
                    exchange: exchangePair[0],
                    pair: exchangePair[1],
                    bids: bidsNewOrder,
                    bidVolumes: orderBook.bids[0][1],
                    asks: asksNewOrder,
                    askVolumes: orderBook.asks[0][1],
                    currentStatus: 4,
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
    unblockTradingPair(trade: any) {
        if (this.stateTrading.length) {
            for (const tradeItem of this.stateTrading) {
                if (trade.typeOrder === 'sell') {
                    if (tradeItem.arbitOrderId === trade.idOrder
                       // && tradeItem.typeOrder === 'buy'
                    ) {
                        tradeItem.canTrade = true;
                    }
                }
                if (trade.typeOrder === 'buy') {
                    if (tradeItem.arbitOrderId === trade.idOrder
                        //&& tradeItem.typeOrder === 'sell'
                    ) {
                        tradeItem.canTrade = true;
                    }
                }
            }
        }
        this.stateTrading = this.stateTrading.filter(item => !item.canTrade);
    }

    getOppositeOrder(arbitId: string, typeOrderDone: string): StateTrading {
        for (const order of this.stateTrading) {
            if (order.arbitOrderId === arbitId && order.typeOrder !== typeOrderDone) {
                return order;
            }
        }
    }

    accessTrading(order: Order) {
        let trade = true;
        if (this.stateTrading) {
            for (const state of this.stateTrading) {
                if (state.exchange === order.exchange &&
                    state.pair === order.pair &&
                    state.canTrade === false) {
                    trade = false;
                }
            }
        }
        return trade;
    }

    setStatusTrade(order: Order) {
        let newOrderFlag = true;
        if (this.stateTrading.length) {
            for (const tradeItem of this.stateTrading) {
                if (tradeItem.exchange === order.exchange
                    && tradeItem.pair === order.pair
                    && tradeItem.typeOrder === order.typeOrder
                ) {
                    tradeItem.canTrade = false;
                    newOrderFlag = false;
                }
            }
            if (newOrderFlag) {
                const newOrder: StateTrading = {
                    exchange: order.exchange,
                    pair: order.pair,
                    typeOrder: order.typeOrder,
                    canTrade: false,
                    arbitOrderId: order.arbitrageId,
                    host: order.host,
                    port: order.port,
                };
                this.stateTrading.push(newOrder);
            }
        } else {
            const newOrder: StateTrading = {
                exchange: order.exchange,
                pair: order.pair,
                typeOrder: order.typeOrder,
                canTrade: false,
                arbitOrderId: order.arbitrageId,
                host: order.host,
                port: order.port,
            };
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

    getSocket(data: any) {
        const hostClient = data.host;
        const portClient = data.port;
       // console.log(hostClient, portClient);
    }

    makeOrders(): Order[] {
        if (this.exchangeData) {
            const currentOrderBooks = this.fetchOrderBook();
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
            this.showData();

            return this.defineSellBuy(currentOrderBooks);
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

    showData() {
       /*  console.log('');
        console.log('');
        console.log('======================================================================='); */
        result = this.getCurrentPrice();
        connectedExhanges = result.filter(this.checkConnectedExchanges);
        const failExchangePrises = result.filter(this.isDisonnectedBot);
        /*  if (failExchangePrises.length) {
             console.table(`${emoji.get('white_frowning_face')} Disconnected bots`, failExchangePrises);
             console.log(`${emoji.get('hammer_and_pick')}  <---------------------------------------------->  ${emoji.get('hammer_and_pick')}`);
         }
         console.log('');
         console.table(result);
         console.log('');
         console.log(`@@@@@@@@@@  BALANCE = ${currentBalance}BTC VOLUME = ${currentVolume}`); */
    }

    getCurrentPrice(): ExchangeData[] {
        return this.exchangeData.map(data => ({
            exchange: data.exchange, pair: data.pair, bids: data.bids[0][0], bidVolumes: data.bids[0][1], asks: data.asks[0][0],
            askVolumes: data.asks[0][1], spread: ((data.asks[0][0] / data.bids[0][0]) - 1) * 100, currentStatus: data.currentStatus,
            status: data.currentStatus > 0, host: data.host, port: data.port, time: Date.now().toString(),
        }));
    }

    defineStateBalance(data: any) {
        if (!fiatPrices) {
            this.getForexPrices();
        }
        if (fiatPrices) {
            const currentForexPair = this.getPriceFiatForex(data.pair);
            const priceConfirmed = (currentForexPair !== undefined) ? (currentForexPair === 'USDJPY') ?
                data.price / +fiatPrices[currentForexPair][0] :
                data.price * +fiatPrices[currentForexPair][0] :
                data.price;
            if (data.typeOrder === 'sell' && data.fulfill) {
                currentVolume -= data.volume;
                currentBalance += priceConfirmed * data.volume;
            }
            if (data.typeOrder === 'buy' && data.fulfill) {
                currentVolume += data.volume;
                currentBalance -= priceConfirmed * data.volume;
            } else {
                console.log('');
                console.log(`/@---@/ !! Arbitrage  order for ${data.typeOrder} # ${data.arbitrageId} not fulfilled!!!!`);
                console.log('');
            }
        }
    }

    defineCurrentForexPair(cryptoPair: string) {
        return this.getPriceFiatForex(cryptoPair);
    }

    defineSellBuy(result: ExchangeData[]) {
        let ordersBot: Order[];
        const maxBuyPrise = this.getMinAsk(result);
        const minSellPrise = this.getMaxBid(result);
        const marketSpread = (minSellPrise / maxBuyPrise - 1) * 100;
        const sellExchange = result.find(findSellExchange);
        const buyExchange = result.find(findBuyExchange);
        function findBuyExchange(data: any) {
            return data.asks === maxBuyPrise;
        }
        function findSellExchange(data: any) {
            return data.bids === minSellPrise;
        }
        //console.log(marketSpread, +SERVER_CONFIG.percentProfit);
        if (sellExchange && buyExchange && marketSpread > +SERVER_CONFIG.percentProfit) {

            const buyForexPair: string = this.defineCurrentForexPair(buyExchange.pair);
            const buyPrice = (buyForexPair !== undefined) ? (buyForexPair === 'USDJPY') ?
                maxBuyPrise * +fiatPrices[buyForexPair][0] :
                maxBuyPrise / +fiatPrices[buyForexPair][0] :
                maxBuyPrise;
            const sellForexPair = this.defineCurrentForexPair(sellExchange.pair);
            const sellPrice = (sellForexPair !== undefined) ? (sellForexPair === 'USDJPY') ?
                minSellPrise * +fiatPrices[sellForexPair][0] :
                minSellPrise / +fiatPrices[sellForexPair][0] :
                minSellPrise;
            const arbitrageUnicId = UUID.UUID();
            const sellerOrder: any = {
                pair: sellExchange.pair,
                exchange: sellExchange.exchange,
                price: sellPrice,
                volume: Number(SERVER_CONFIG.tradeVolume),
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
                volume: +SERVER_CONFIG.tradeVolume,
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
        return ordersBot;
    }

    private setOrdersForTrade(
        sellerOrder: Order, buyerOrder: Order,
        sellExchange: any, marketSpread: number, buyExchange: any): Order[] {
        const ordersBot: Order[] = [];
        //if (currentVolume === 0 && sellerOrder && buyerOrder) {
        if (sellerOrder && buyerOrder) {
            ordersBot.push(sellerOrder);
            ordersBot.push(buyerOrder);
            console.log(`pair ${sellExchange.pair} sell: ${sellerOrder.exchange}
             ${sellerOrder.price} buy: ${buyerOrder.exchange} ${buyerOrder.price}  spread: ${marketSpread}%`);
        }
       /*  if (currentVolume > 0) {
            ordersBot.push(sellerOrder);
            console.log(`pair ${sellExchange.pair} sell: ${sellerOrder.exchange} ${sellerOrder.price}  spread: ${marketSpread}%`);
        }
        if (currentVolume < 0) {
            ordersBot.push(buyerOrder);
            console.log(`pair ${buyExchange.pair} buy: ${buyerOrder.exchange} ${buyerOrder.price}  spread: ${marketSpread}%`);
        } */
        return ordersBot;
    }

    isDisonnectedBot(data: any) {
        if (data.status) {
            return false;
        } else {
           /*  console.error(`${emoji.get('fire')}<---------------------------------------------->${emoji.get('fire')}`);
            console.log(`from ${data.exchange} old data ${data.pair}, try reconnect ${data.host}:${data.port} ${emoji.get('exclamation')}`); */
            return true;
        }
    }

    parseTrades(newTrades: any): Trade[] {
        const trades: Trade[] = [];
        const tradedOrders = newTrades.payload.params[0];
        const host = newTrades.payload.params[1];
        const port = newTrades.payload.params[2];
        if (tradedOrders.length) {
            for (const trade of tradedOrders) {
                trades.push(trade);
            }
        }
        return trades;
    }

    checkConnectedExchanges(data: any) {
        if (data.status) {
            return true;
        } else {
            return false;
        }
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
