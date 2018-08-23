import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent implements OnInit {
  sellCount: number;
  buyCount: number;
  asset = 'BTC';
  selected: { start: any, end: any };
  startDate: any;
  endDate: any;
  source: any;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.source = interval(1000);
    this.updateDate();
  }

  updateDate() {
    const t = this.source.subscribe((x: any) => {
      this.fetchData();
    });
  }

  fetchData() {
    const interval24 = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
    const startOfDay = Math.floor(Date.now() / interval24) * interval24;
    const endOfDay = Date.now(); // let endOfDay = startOfDay + interval - 1; // 23:59:59:9999
    this.userService.getData<any[]>(`trades/statistic/?startDate=${startOfDay}&endDate=${endOfDay}&asset=${this.asset}&typeOrder=sell`)
      .subscribe(data => {
        if (data.length) {
          this.sellCount = +data[0].total;
        }
      });
    this.userService.getData<any[]>(`trades/statistic/?startDate=${startOfDay}&endDate=${endOfDay}&asset=${this.asset}&typeOrder=buy`)
      .subscribe(data => {
        if (data.length) {
          this.buyCount = +data[0].total;
        }
      });
  }

  async download() {
    if (this.selected.start && this.selected.end) {
      const utcStartDate = Date.parse(this.selected.start);
      const utcEndDate = Date.parse(this.selected.end);
      console.log(utcStartDate, utcEndDate);
      this.userService.getData<any[]>
        (`trades/statistic/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}&typeOrder=sell`)
        .subscribe(data => {
          if (data) {
            this.sellCount = +data[0].total;
          }
        });
      this.userService.getData<any[]>
        (`trades/statistic/?startDate=${utcStartDate}&endDate=${utcEndDate}&asset=${this.asset}&typeOrder=buy`)
        .subscribe(data => {
          if (data) {
            this.buyCount = +data[0].total;
          }
        });
    } else {
      alert('Введите даты поискового диапазона!');
    }
  }
}
