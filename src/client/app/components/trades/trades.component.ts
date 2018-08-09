import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import { UserService } from './../../services/user.service';
import { Component, OnInit} from '@angular/core';
import { Trade } from '../../shared/models/trade';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss']
})
export class TradesComponent implements OnInit {
  asset: any;
  selected: { start: any, end: any };
  angular5Csv: Angular5Csv;
  startDate: any;
  endDate: any;
  items: Trade[];
  req: any[];
  constructor(private userService: UserService) { }

  ngOnInit() {
    const interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
    const startOfDay = Math.floor(Date.now() / interval) * interval;
    const endOfDay = Date.now(); //let endOfDay = startOfDay + interval - 1; // 23:59:59:9999
   this.userService.getData<Trade[]>(`trades/find/?startDate=${startOfDay}&endDate=${endOfDay}&asset=.*`)
      .subscribe(data => {
        this.items = data;
      });
  }

  async download() {
    if (this.selected.start && this.selected.end) {
      const utcStartDate = Date.parse(this.selected.start);
      const utcEndDate = Date.parse(this.selected.end);
      console.log(utcStartDate, utcEndDate);
      await this.userService.getData<Trade[]>(`trades/find/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}`)
      .subscribe(data => {
        this.items = data;
        this.createCsv(this.items, utcStartDate, utcEndDate, this.asset.toString());
      });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  createCsv(orderData: Trade[], startDate: number, endDate: number, asset: string) {
    const stDate = new Date(startDate).toDateString();
    const finishfDate = new Date(endDate).toDateString();
    const chuckSize = 40000;
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      headers: ['exchangeName', 'pair', 'price', 'volume',
        'typeOrder', 'arbitrageId', 'exchOrderId', 'time']
    };
    let i, j, temparray;
    for (i = 0, j = orderData.length; i < j; i += chuckSize) {
      temparray = orderData.slice(i, i + chuckSize);
      this.angular5Csv = new Angular5Csv(temparray, `${asset}_Trades_${stDate}_${finishfDate}_length${i}`, options);
    }
  }
}
