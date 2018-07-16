import { UserService } from './../../services/user.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Trade } from '../../shared/models/trade';
import { MatDatepicker, MatDatepickerToggle } from '@angular/material';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss']
})
export class TradesComponent implements OnInit {
  @ViewChild(MatDatepicker) startPicker: MatDatepicker<Date>;
  @ViewChild(MatDatepicker) endPicker: MatDatepicker<Date>;
  startDate: any;
  endDate: any;
  items: Trade[];
  req: any[];
  constructor(private userService: UserService) { }

  ngOnInit() {
    const interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
    const startOfDay = Math.floor(Date.now() / interval) * interval;
    const endOfDay = Date.now(); //let endOfDay = startOfDay + interval - 1; // 23:59:59:9999
    this.userService.getData<Trade[]>(`trades/find/?startDate=${startOfDay}&endDate=${endOfDay}`)
      .subscribe(data => {
        this.items = data;
      });
  }
  async download(startDate: string, endDate: string) {
    console.log(startDate, endDate);
    if (startDate && endDate) {
      const utcStartDate = Date.parse(startDate);
      const utcEndDate = Date.parse(endDate);
      await this.userService.getData<Trade[]>(`trades/find/?startDate=${startDate}&endDate=${endDate}`)
      .subscribe(data => {
        this.items = data;
      });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

}
