import { Component, OnInit } from '@angular/core';
import { UserService } from './../../services/user.service';
import { Order } from './../../shared/models/order';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  startData: string;
  endData: string;
  angular5Csv: Angular5Csv;
  orders: Order[];

  constructor(private userService: UserService) { }

  ngOnInit() {
    const interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
    let startOfDay = Math.floor(Date.now() / interval) * interval;
    let endOfDay = Date.now(); //let endOfDay = startOfDay + interval - 1; // 23:59:59:9999
    this.userService.getData<Order[]>(`orders/find/?startDate=${startOfDay}&endDate=${endOfDay}`)
      .subscribe(data => {
        this.orders = data;
        console.log('this.items :', this.orders);
      });
  }

  async download(startDate: string, endDate: string) {
    if (startDate && endDate) {
      const utcStartDate = Date.parse(startDate);
      const utcEndDate = Date.parse(endDate);
      await this.userService.getData<Order[]>(`orders/find/?startDate=${utcStartDate}&endDate=${utcEndDate}`)
        .subscribe(data => {
          this.orders = data;
          this.createCsv(this.orders, startDate, endDate);
        });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  createCsv(orderData: Order[], startDate: string, endDate: string) {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      headers: ['exchangeName', 'pair', 'price', 'volume',
        'typeOrder', 'fee', 'arbitrageId', 'deviationPrice', 'time']
    };
    this.angular5Csv = new Angular5Csv(orderData, `Orders_${startDate}_${endDate}`, options);
  }
}
