import { Trade } from './../common/models/trade';
import { Order } from './../common/models/order';
const net = require('toa-net');
// import * as uniqid from 'uniqid';
import { Parser } from './parser';
import { OrderBookService } from './../db/orderBook/orderBook.service';
import { OrderService } from './../db/order/order.service';
import { IDataExchange } from './../common/models/dataExchange';
import { Controller } from '@nestjs/common';
import { ClientTcp } from './client-tcp';
import { TradeService } from './../db/trade/trade.service';
import { StateTrading } from './../common/models/stateTrading';
import { ExchangeData } from './../common/models/exchangeData';
import { SERVER_CONFIG } from './../../server.constants';
const auth = new net.Auth('secretxxx');

@Controller()
export class ServerTcpBot {
    server: any;
    parser: Parser;
    clientsTcp: ClientTcp[] = [];
    stateTrading: StateTrading[] = [];
    startFlag = true;

    constructor(
        private readonly orderBooksService: OrderBookService,
        private readonly orderService: OrderService,
        private readonly tradeService: TradeService) {
        this.parser = new Parser(this.orderBooksService);
    }

    createTcpServer() {
        this.server = new net.Server((socket: any) => {
            socket.on('message', (message: any) => {
                if (message.type === 'notification' && message.payload.method === 'trades') {
                    const trades = this.parser.parseTrades(message);
                    if (trades.length) {
                        for (const trade of trades) {
                            this.tradeService.addNewData(trade);
                            this.cancelOppositeArbitOrder(trade);
                            this.requestBalanceArbitId(trade);
                        }
                    }
                }
                if (message.type === 'notification' && message.payload.method === 'statusOrder') {
                    this.orderService.updateStatusOrder(message.payload.params[0], message.payload.params[1],
                        message.payload.params[2], message.payload.params[3], message.payload.params[4]);
                    if (!this.startFlag) {
                        const orders = this.parser.makeOrders();
                        if (orders) {
                            this.sendOrdersToBot(orders);
                        }
                    }
                    if (message.payload.params[2] !== 'open') {
                        const trade = {
                            exchange: '', pair: '', price: '', volume: '', typeOrder: message.payload.params[1],
                            idOrder: message.payload.params[0], exchOrderId: '', time: ''
                        };
                        this.parser.unblockTradingPair(trade);
                    }
                }
                if (message.type === 'notification' && message.payload.method === 'resCheckOrder') {
                    // const currentBalanceArbitId = this.balanceService.addOppositeTrade(message.payload.params[0])
                    // this.parser.unblockTradingPair(trade);
                    const checkingOrder = JSON.parse(message.payload.params[0]);
                    console.log('+++@@@!!!checkingOrder :', checkingOrder);
                } else {
                    const parsedMessage = this.parser.parseTcpMessage(message);
                    this.parser.calculateAskBid(parsedMessage);
                    if (this.startFlag) {
                        const orders = this.parser.makeOrders();
                        if (orders) {
                            this.sendOrdersToBot(orders);
                            this.startFlag = false;
                        }

                    }

                }
            });
        });
        this.server.listen(SERVER_CONFIG.tcpPort);
        console.log(`Tcp server listen port ${SERVER_CONFIG.tcpPort}`);

        // Enable authentication for server
        this.server.getAuthenticator = () => {
            return (signature: string) => auth.verify(signature);
        };
    }

    private cancelOppositeArbitOrder(trade: Trade) {
        const type = trade.typeOrder === 'sell' ? 'buy' : 'sell';
        return this.orderService.findOrderById(trade.arbitrageId, type)
        .then((order) => {
            const oppositeCheckOrder = {
                name: 'checkOrder', order: { orderIdExchange: order.exchangeId, pairOrder: order.pair, type: order.typeOrder },
                serverPort: order.port, host: order.host,
            };
            this.startClient(oppositeCheckOrder);
        });
    }

    private requestBalanceArbitId(trade: Trade) {
        const oppositeArbitOrder = this.parser.getOppositeOrder(trade.arbitrageId, trade.typeOrder);
        if (oppositeArbitOrder) {
            const oppositeCheckOrder = {
                name: 'checkOrder', order: { arbitOrderId: oppositeArbitOrder.arbitOrderId },
                serverPort: oppositeArbitOrder.port, host: oppositeArbitOrder.host,
            };
            this.startClient(oppositeCheckOrder);
        }

        /// return this.getCurrentBalanceArbitOrder(trade);
    }
    stopTcpServer() {
        this.server.close();
        console.log('Tcp server stoped');
    }
    createClient(clientSocket: any) {
        const newClientTcp = new net.Client();
        this.clientsTcp.push({ socket: clientSocket, client: newClientTcp });
        newClientTcp.getSignature = () => {
            return auth.sign({ id: 'clientIdxxx' });
        };
        newClientTcp.connect(clientSocket);
        return newClientTcp;
    }
    sendOrdersToBot(orders: Order[]) {
        if (orders.length) {
            for (const currentOrder of orders) {
                const parametersOrder = {
                    nameOrder: 'sendOrder',
                    serverPort: currentOrder.port, host: currentOrder.host,
                    order: currentOrder,
                };
                const enableTrading = this.parser.accessTrading(currentOrder);
                if (enableTrading && parametersOrder.order.price > 0) {
                    this.startClient(parametersOrder);
                    this.orderService.addNewData(currentOrder);
                    this.parser.setStatusTrade(currentOrder);
                }
            }
        }
    }
    startClient(order: any) {
        try {
            if (order.host && order.serverPort) {
                const clientSocket = `tcp://${order.host}:${order.serverPort}`;
                let currentClient = this.defineTcpClient(clientSocket);
                if (!currentClient) {
                    currentClient = this.createClient(clientSocket);
                }
                currentClient.on('error', (err: any) => {
                    if (err.code === 'ETIMEDOUT') {
                        currentClient.destroy();
                    }
                    currentClient.reconnect();
                });
                const stringOrder = JSON.stringify(order.order);
                currentClient.notification(order.nameOrder, [`${stringOrder}`]);
            }
        } catch (e) {
            console.log('err :', e);
        }
    }
    defineTcpClient(socketTcp: any): any {
        if (this.clientsTcp) {
            for (const iterator of this.clientsTcp) {
                if (iterator.socket === socketTcp) {
                    return iterator.client;
                }
            }
        }
    }
    getCurrentPrice(): ExchangeData[] {
        return this.parser.getCurrentPrice();
    }
}
