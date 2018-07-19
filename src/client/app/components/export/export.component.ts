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
          this.createCsv(this.items, this.startDate, this.endDate, this.asset.toString());
        });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  createCsv(orderData: OrderBook[], startDate: string, endDate: string, asset: string) {
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
