import { RateService } from './../db/rate/rate.service';
import { Order } from './../common/models/order';

const net = require('toa-net');
import { Parser } from './parser';
import { OrderBookService } from './../db/orderBook/orderBook.service';
import { OrderService } from './../db/order/order.service';
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
    private readonly tradeService: TradeService,
    private readonly rateService: RateService) {
    this.parser = new Parser(this.orderBooksService, this.rateService);
  }

  passTradeToDB(message: any, status: string) {
    const trades = this.parser.parseTrades(message);
    if (trades) {
      for (const trade of trades) {
        // const status = (trade.remainingSize === 0) ? 'done' : 'partial';
        this.orderService.updateStatusOrder(trade.arbitrageId, trade.typeOrder, trade.exchOrderId, status, '');
        this.parser.subTradedVolume(trade);
        this.tradeService.addNewData(trade);
        let newOrder;
        if (this.parser.orderFullFilled(trade)) {
          const newOrderBook = this.parser.addNewOrderBookData();
          newOrder = this.parser.defineSellBuy(newOrderBook);
        } else {
          newOrder = this.parser.makePartialOrder(trade);
        }
        if (newOrder) {
          this.sendOrdersToBot(newOrder);
        }
      }
    }
  }

  generateOrderAfterCancel(message: any) {
    const trades = this.parser.parseTrades(message);
    if (trades) {
      for (const trade of trades) {
        this.orderService.updateStatusOrder(trade.arbitrageId, trade.typeOrder, trade.exchOrderId, 'cancelled', '');
        const order: Order[] = this.parser.replaceCancelledOrderByNewOrder(trade);
        if (order) {
          this.sendOrdersToBot(order);
        }
      }
    }
  }

  createTcpServer() {
    if (!this.server) {
      this.startServer();
    } else if (!this.server.address()) {
      this.startServer();
    } else {
      console.log('the already started');
    }
  }

  startServer() {
    this.server = new net.Server((socket: any) => {
      socket.on('message', (message: any) => {
        if (message.type === 'notification' //  && message.payload.method === 'trades' ||
          && message.payload.method === 'partial' || message.payload.method === 'done') {
          console.log('message.payload.method :', message.payload.method);
          this.passTradeToDB(message, message.payload.method);
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
            this.passTradeToDB(message, message.payload.params[3]);
          }
          if (message.payload.params[3] === 'cancelled') {
            this.generateOrderAfterCancel(message);
          }
        }
        else {
          const parsedMessage = this.parser.parseTcpMessage(message);
          this.parser.calculateAskBid(parsedMessage);
          const newOrderBook = this.parser.addNewOrderBookData();
          if (this.startFlag) {
            const orders = this.parser.defineSellBuy(newOrderBook);
            if (orders) {
              console.log('this.startFlag :', this.startFlag);
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

  getSpread() {
    return this.parser.getBidAskSpread();
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
        const stringOrder = JSON.stringify(order.order);
        console.log('stringOrderstringOrder :', stringOrder);
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
