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
  @ViewChild(MatDatepicker) startPicker: MatDatepicker<Date>;
  @ViewChild(MatDatepicker) endPicker: MatDatepicker<Date>;
  @ViewChild('asset') asset: ElementRef;
  startDate: any;
  endDate: any;
  angular5Csv: Angular5Csv;
  items: OrderBook[];

  constructor(private userService: UserService) { }

  ngOnInit() { }

  public onStartDate(event: any): void {
    this.startDate = new Date(event).valueOf();
  }

  public onEndDate(event: any): void {
    this.endDate = new Date(event).valueOf();
  }

  public onAsset(event: any): void {
    this.asset = event.valueOf();
  }

  async download() {
    if (this.startDate && this.endDate) {
      const utcStartDate = Date.parse(this.startDate);
      const utcEndDate = Date.parse(this.endDate);
      await this.userService.getData<OrderBook[]>(
        `orderBooks/order-books/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}`)
        .subscribe(data => {
          this.items = data;
          this.createCsv(this.items, this.startDate, this.endDate);
        });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  createCsv(orderData: OrderBook[], startDate: string, endDate: string) {
    const chuckSize = 40000;
    let lengthSting = 0;
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      headers: ['exchangeName', 'pair', 'bid', 'bidVolume', 'ask', 'askVolume', 'time']
    };
    let chunkArray: any[];
    if (orderData.length > chuckSize) {
      console.log('orderData.length :', orderData.length);
      chunkArray = new Array(Math.ceil(orderData.length / chuckSize)).map((_: OrderBook) => orderData.splice(0, chuckSize));
      console.log('chunkArray.length :', chunkArray.length);
      for (const iterator of chunkArray) {
        lengthSting += iterator.length;
        this.angular5Csv = new Angular5Csv(iterator, `Orders_${startDate}_${endDate}_length${lengthSting}`, options);
      }
    } else {
      this.angular5Csv = new Angular5Csv(orderData, `Orders_${startDate}_${endDate}`, options);
    }
  }
}
