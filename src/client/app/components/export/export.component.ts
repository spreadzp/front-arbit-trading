import { UserService } from './../../services/user.service';
import { OrderBook } from './../../shared/models/orderBook.model';
import { Component, OnInit } from '@angular/core';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  asset: any;
  timestamp: number;
  startDate: any;
  endDate: any;
  angular5Csv: Angular5Csv;
  selected: { start: any, end: any };
  items: OrderBook[];

  constructor(private userService: UserService) { }

  ngOnInit() { }

  getDataTimeStamp(timestamp: number) {
    this.download('timestamp');
    this.timestamp = timestamp;
  }

  async download(textForNameFile?: string) {
    if (this.selected.start && this.selected.start) {
      const utcStartDate = Date.parse(this.selected.start);
      const utcEndDate = Date.parse(this.selected.end);
      console.log('object :', utcStartDate, '&', utcEndDate);
      await this.userService.getData<OrderBook[]>(
        `orderBooks/order-books/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}`)
        .subscribe(data => {
          this.items = data;
          console.log(' this.items: ',  this.items);
          const timeData = this.convertToTimeStamp(data, utcStartDate, utcEndDate, this.timestamp);
          this.createCsv(this.convertOneLine(timeData), utcStartDate, utcEndDate, this.asset.toString(), textForNameFile);
        });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  convertToTimeStamp(data: any[], startData: number, endData: number, timestamp: number): OrderBook[] {
    const tempOrderBook: OrderBook[] = [];
    const orderBookIntoTimestamp: any[] = [];
    let stamp;
    for (const iterator of data) {
      const index = orderBookIntoTimestamp.findIndex(item => item.exchangeName === iterator.exchangeName);
      if (index >= 0 && stamp > +iterator.time) {
        if (orderBookIntoTimestamp[index].pair === iterator.pair) {
          orderBookIntoTimestamp[index].bid = (iterator.bid > orderBookIntoTimestamp[index].bid)
            ? iterator.bid : orderBookIntoTimestamp[index].bid;
          orderBookIntoTimestamp[index].bidVolume = iterator.bidVolume;
          orderBookIntoTimestamp[index].ask = (orderBookIntoTimestamp[index].ask > iterator.ask)
            ? iterator.ask : orderBookIntoTimestamp[index].ask;
          orderBookIntoTimestamp[index].askVolume = iterator.askVolume;
          orderBookIntoTimestamp[index].time = stamp;
        }
      } else if (stamp <= +iterator.time) {
        for (const book of orderBookIntoTimestamp) {
          tempOrderBook.push(book);
        }
        orderBookIntoTimestamp.length = 0;
        stamp = +iterator.time + timestamp;
      } else {
        stamp = +iterator.time + timestamp;
        const newItem = {
          exchangeName: iterator.exchangeName,
          pair: iterator.pair,
          bid: iterator.bid,
          bidVolume: iterator.bidVolume,
          ask: iterator.ask,
          askVolume: iterator.askVolume,
          time: stamp
        };
        orderBookIntoTimestamp.push(newItem);
      }
    }
    return tempOrderBook;
  }

  getExchange(orderBook: OrderBook[]) {
    const exchangeNames: string[] = [];
    for (const order of orderBook) {
      const index = exchangeNames.find(item => item === order.exchangeName);
      if (!index) {
        exchangeNames.push(order.exchangeName);
      }
    }
    return exchangeNames;
  }

  getExchangeHeader(orderBook: any) {
    const header: string[] = ['time'];
    for (const name of orderBook.names) {
      header.push(`pair-${name}`);
      header.push(`bid-${name}`);
      header.push(`bidVolume-${name}`);
      header.push(`ask-${name}`);
      header.push(`askVolume-${name}`);
    }
    return header;
  }

  convertOneLine(orderData: OrderBook[]) {
    const convertData: any = {
      names: [],
      data: []
    };

    const temp: any = {};
    const exchangeNames: any = {};

    for (const orderBook of orderData) {
      exchangeNames[orderBook.exchangeName] = false;
      if (!temp[orderBook.time]) {
        temp[orderBook.time] = {};
      }

      temp[orderBook.time][orderBook.exchangeName] = orderBook;
    }

    for (const name in exchangeNames) {
      convertData.names.push(name);
    }

    const data = convertData.data;
    const needFiles = ['pair', 'bid', 'bidVolume', 'ask', 'askVolume'];

    for (const time in temp) {

      const last = [];
      last.push(time);

      const timeline = temp[time];

      for (const name of convertData.names) {

        const orderBook: any = timeline[name];

        for (let i = 0; i < needFiles.length; ++i) {
          if (orderBook) {
            last.push(orderBook[needFiles[i]]);
          } else {
            last.push('');
          }
        }
      }
      data.push(last);
    }

    return convertData;
  }

  createCsv(orderData: any, startDate: number, endDate: number, asset: string, nameFile?: string) {
    console.log('orderData :', orderData);
    const heders = this.getExchangeHeader(orderData);
    console.log('heders :', heders);
    const stDate = new Date(startDate).toDateString();
    const finishfDate = new Date(endDate).toDateString();
    const chuckSize = 40000;
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      headers: heders
    };
    let i, j, temparray;
    const data = orderData.data;
    for (i = 0, j = data.length; i < j; i += chuckSize) {
      temparray = data.slice(i, i + chuckSize);
      const fileName = (nameFile === undefined) ? 'orderbooks' : nameFile;
      this.angular5Csv = new Angular5Csv(temparray, `${asset}_ ${fileName}_${stDate}_${finishfDate}_length${i}`, options);
    }
  }
}
