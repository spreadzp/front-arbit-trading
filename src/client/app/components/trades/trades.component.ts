import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import { UserService } from './../../services/user.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('asset') asset: ElementRef;
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

  public onStartDate(event: any): void {
    this.startDate = new Date(event).valueOf();
    console.log('this.startDate :', this.startDate );
  }

  public onEndDate(event: any): void {
    this.endDate = new Date(event).valueOf();
    console.log('this.endDate :', this.endDate);
  }

  public onAsset(event: any): void {
    this.asset = event.valueOf();
  }

  async download() {
    console.log(this.startDate, this.endDate);
    if (this.startDate && this.endDate) {

      const utcStartDate = Date.parse(this.startDate);
      const utcEndDate = Date.parse(this.endDate);
      console.log(utcStartDate, utcEndDate);
      await this.userService.getData<Trade[]>(`trades/find/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}`)
      .subscribe(data => {
        this.items = data;
        this.createCsv(this.items, this.startDate, this.endDate, this.asset.toString());
      });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }

  createCsv(orderData: Trade[], startDate: string, endDate: string, asset: string) {
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
        'typeOrder', 'idOrder', 'exchOrderId', 'time']
    };
    let i, j, temparray;
    for (i = 0, j = orderData.length; i < j; i += chuckSize) {
      temparray = orderData.slice(i, i + chuckSize);
      this.angular5Csv = new Angular5Csv(temparray, `${asset}_Trades_${stDate}_${finishfDate}_length${i}`, options);
    }
  }
}
