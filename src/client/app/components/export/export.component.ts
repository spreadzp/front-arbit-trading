import { UserService } from './../../services/user.service';
import { OrderBook } from './../../shared/models/orderBook.model';
import { Component, OnInit } from '@angular/core';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import { DatepickerOptions } from 'ng2-datepicker';
import * as frLocale from 'date-fns/locale/fr';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  startData: string;
  endData: string;
  angular5Csv: Angular5Csv;
  items: OrderBook[];

  constructor(private userService: UserService) { }

  ngOnInit() { }

  async download(startDate: string, endDate: string) {
    if (startDate && endDate) {
      const utcStartDate = Date.parse(startDate);
      const utcEndDate = Date.parse(endDate);
      await this.userService.getData<OrderBook[]>(`orderBooks/order-books/?startDate=${utcStartDate}&endDate=${utcEndDate}`)
        .subscribe(data => {
          this.items = data;
          this.createCsv(this.items, startDate, endDate);
        });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  createCsv(orderData: OrderBook[], startDate: string, endDate: string) {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      headers: ['exchangeName', 'pair', 'bid', 'ask', 'time']
    };
    this.angular5Csv = new Angular5Csv(orderData, `OrderBook_${startDate}_${endDate}`, options);
  }
}
