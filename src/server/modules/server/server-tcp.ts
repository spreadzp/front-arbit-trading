import { Trade } from './../common/models/trade';
import { Order } from './../common/models/order';
const net = require('toa-net');
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

    passTradeToDB(message: any) {
        const trades = this.parser.parseTrades(message);
        if (trades) {
            for (const trade of trades) {
                this.parser.subTradedVolume(trade);
                this.tradeService.addNewData(trade);
                let newOrder;
                if (this.parser.orderFullFilled(trade)) {
                    newOrder = this.parser.makeOrders();
                } else {
                    newOrder = this.parser.makePartialOrder(trade);
                }
                if (newOrder) {
                    this.sendOrdersToBot(newOrder);
                }
            }
        }
    }

    createTcpServer() {
        this.server = new net.Server((socket: any) => {
            socket.on('message', (message: any) => {
                if (message.type === 'notification'
                && message.payload.method === 'trades' || message.payload.method === 'partial' || message.payload.method === 'done') {
                    this.passTradeToDB(message);
                }
                if (message.type === 'notification' && message.payload.method === 'statusOrder') {

                    console.log('status=', message.payload.params[3]);
                    this.orderService.updateStatusOrder(message.payload.params[0], message.payload.params[1],
                        message.payload.params[2], message.payload.params[3], message.payload.params[4]);
                    if (message.payload.params[3] === 'open') {
                        const trade = {
                            exchange: '', pair: '', price: '', volume: '', typeOrder: message.payload.params[1],
                            arbitOrderId: message.payload.params[0], exchOrderId: '', time: ''
                        };
                        this.checkOrder(trade);
                    }
                    if (message.payload.params[3] === 'done') {
                        this.passTradeToDB(message);
                        const trade = {
                            exchange: '', pair: '', price: '', volume: '', typeOrder: message.payload.params[1],
                            arbitOrderId: message.payload.params[0], exchOrderId: '', time: ''
                        };
                    }
                }
                if (message.type === 'notification' && message.payload.method === 'resCheckOrder') {
                    const checkingOrder = JSON.parse(message.payload.params[0]);
                    console.log('+++///   ** @checkingOrder :', checkingOrder);
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

        //  Enable authentication for server
        this.server.getAuthenticator = () => {
            return (signature: string) => auth.verify(signature);
        };
    }

    private checkOrder(trade: any) {
        const type = trade.typeOrder;
        return this.orderService.findOrderById(trade.arbitrageId, type)
            .then((order) => {
                if (order) {
                    const checkingOrder = {
                        nameOrder: 'checkOrder', order: { orderIdExchange: order.exchangeId, pairOrder: order.pair, type: order.typeOrder },
                        serverPort: order.port, host: order.host,
                    };
                    this.startClient(checkingOrder);
                }
            });
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
        if (orders) {
            for (const currentOrder of orders) {
                const parametersOrder = {
                    nameOrder: 'sendOrder',
                    serverPort: currentOrder.port, host: currentOrder.host,
                    order: currentOrder,
                };
                if (parametersOrder.order.price > 0) {
                    this.startClient(parametersOrder);
                    this.orderService.addNewOrder(currentOrder);
                    // this.parser.setStatusTrade(currentOrder);
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
                console.log('order.nameOrder', order.nameOrder);
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
