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
    console.log('timestamp :', timestamp);
    this.download();
    this.timestamp = timestamp;
  }

  getPercentData(timestamp: number) {
    console.log('getPercentData timestamp :', timestamp);
    this.timestamp = timestamp;
  }

  async download() {
    if (this.selected.start && this.selected.start) {
      const utcStartDate = Date.parse(this.selected.start);
      const utcEndDate = Date.parse(this.selected.end);
      await this.userService.getData<OrderBook[]>(
        `orderBooks/order-books/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}`)
        .subscribe(data => {
          this.items = data;
          console.log('this.timestamp :', this.timestamp);
          const timeData = this.convertToTimeStamp(data, utcStartDate, utcEndDate, this.timestamp);
          this.createCsv(timeData, utcStartDate, utcEndDate, this.asset.toString());
        });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  convertToTimeStamp(data: any, startData: number, endData: number, timestamp: number): OrderBook[] {
    const tempOrderBook: OrderBook[] = [];
    let orderBookIntoTimestamp: any[] = [];
    let stamp = startData + timestamp;
    for (const iterator of data) {
      const index = orderBookIntoTimestamp.findIndex(item => item.exchangeName === iterator.exchangeName);
      if (index > 0 && orderBookIntoTimestamp[index].pair === iterator.pair) {
        console.log(index,   iterator.exchangeName);
        orderBookIntoTimestamp[index].bid = (iterator.bid > orderBookIntoTimestamp[index - 1].bid)
          ? iterator.bid : orderBookIntoTimestamp[index - 1].bid;
        orderBookIntoTimestamp[index].bidVolume = iterator.bidVolume;
        orderBookIntoTimestamp[index].ask = (orderBookIntoTimestamp[index - 1].ask > iterator.ask)
          ? iterator.ask : orderBookIntoTimestamp[index - 1].ask;
        orderBookIntoTimestamp[index].askVolume = iterator.askVolume;
        orderBookIntoTimestamp[index].time = iterator.time;
      } else if (stamp <= iterator.time) {
        for (const book of orderBookIntoTimestamp) {
          tempOrderBook.push(book);
        }
        orderBookIntoTimestamp.length = 0;
        stamp += timestamp;
      } else {
        const newItem = {
          exchangeName: iterator.exchangeName, pair: iterator.pair,
          bid: iterator.bid,
          bidVolume: iterator.bidVolume,
          ask: iterator.ask,
          askVolume: iterator.askVolume,
          time: iterator.time
        };
        orderBookIntoTimestamp.push(newItem);
      }
    }
    return tempOrderBook;
  }

  createCsv(orderData: OrderBook[], startDate: number, endDate: number, asset: string) {
    console.log('orderData :', orderData);
    const stDate = new Date(startDate).toDateString();
    const finishfDate = new Date(endDate).toDateString();
    const chuckSize = 40000;
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      headers: ['exchangeName', 'pair', 'bid', 'bidVolume', 'ask', 'askVolume', 'time']
    };
    let i, j, temparray;
    for (i = 0, j = orderData.length; i < j; i += chuckSize) {
      temparray = orderData.slice(i, i + chuckSize);
      this.angular5Csv = new Angular5Csv(temparray, `${asset}_Orderbooks_${stDate}_${finishfDate}_length${i}`, options);
    }
  }
}
