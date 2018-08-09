import { MatDatepicker } from '@angular/material';
import { UserService } from './../../services/user.service';
import { OrderBook } from './../../shared/models/orderBook.model';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import { DatepickerOptions } from 'ng2-datepicker';
import * as frLocale from 'date-fns/locale/fr';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  asset: any;
  startDate: any;
  endDate: any;
  angular5Csv: Angular5Csv;
  selected: { start: any, end: any };
  items: OrderBook[];

  constructor(private userService: UserService) { }

  ngOnInit() { }
  async download() {
    if (this.selected.start && this.selected.start) {
      const utcStartDate = Date.parse(this.selected.start);
      const utcEndDate = Date.parse(this.selected.end);
      await this.userService.getData<OrderBook[]>(
        `orderBooks/order-books/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}`)
        .subscribe(data => {
          this.items = data;
          this.createCsv(this.items, utcStartDate, utcEndDate, this.asset.toString());
        });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  createCsv(orderData: OrderBook[], startDate: number, endDate: number, asset: string) {
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
