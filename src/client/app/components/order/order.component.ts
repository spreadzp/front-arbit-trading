import { MatDatepicker } from '@angular/material';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from './../../services/user.service';
import { Order } from './../../shared/models/order';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  @ViewChild(MatDatepicker) startPicker: MatDatepicker<Date>;
  @ViewChild(MatDatepicker) endPicker: MatDatepicker<Date>;
  @ViewChild('asset') asset: ElementRef;
  startDate: any;
  endDate: any;
  angular5Csv: Angular5Csv;
  orders: Order[];

  constructor(private userService: UserService) { }

  ngOnInit() {
    const interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
    let startOfDay = Math.floor(Date.now() / interval) * interval;
    let endOfDay = Date.now(); //let endOfDay = startOfDay + interval - 1; // 23:59:59:9999
    this.userService.getData<Order[]>(`orders/find/?startDate=${startOfDay}&endDate=${endOfDay}&asset=.*`)
      .subscribe(data => {
        this.orders = data;
        console.log('this.items :', this.orders);
      });
  }

  public onStartDate(event: any): void {
    this.startDate = new Date(event).valueOf();
    console.log('this.startDate :', this.startDate);
  }

  public onEndDate(event: any): void {
    this.endDate = new Date(event).valueOf();
    console.log('this.endDate :', this.endDate);
  }

  public onAsset(event: any): void {
    this.asset = event.valueOf();
  }

  async download() {
    if (this.startDate && this.endDate) {
      const utcStartDate = Date.parse(this.startDate);
      const utcEndDate = Date.parse(this.endDate);
      await this.userService.getData<Order[]>(
        `orders/find/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}`)
        .subscribe(data => {
          this.orders = data;
          this.createCsv(this.orders, this.startDate, this.endDate);
        });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  createCsv(orderData: Order[], startDate: string, endDate: string) {
    const chuckSize = 40000;
    let lengthSting = 0;
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      headers: ['exchangeName', 'pair', 'price', 'volume',
        'typeOrder', 'fee', 'arbitrageId', 'deviationPrice', 'time']
    };
    let chunkArray: any[];
    if (orderData.length > chuckSize) {
      chunkArray = new Array(Math.ceil(orderData.length / chuckSize)).map((_: Order) => orderData.splice(0, chuckSize));
      for (const iterator of chunkArray) {
        lengthSting += iterator.length;
        this.angular5Csv = new Angular5Csv(iterator, `Orders_${startDate}_${endDate}_length${lengthSting}`, options);
      }
    } else {
      this.angular5Csv = new Angular5Csv(orderData, `Orders_${startDate}_${endDate}`, options);
    }
  }
}
