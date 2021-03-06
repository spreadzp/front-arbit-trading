import { interval } from 'rxjs';
import { UserService } from './../../../services/user.service';

import { Component, OnInit } from '@angular/core';
import { ExchangeData } from '../../../shared/models/exchangeData';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  items: ExchangeData[];
  req: any[];
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
    this.userService.getData<ExchangeData[]>('sever-tcp/current-price')
      .subscribe(data => {
        this.items = data;
      });
  }

  startTcp() {
    this.userService.startTcp()
      .subscribe(data => {
        this.req = data;
        console.log('data :', data);
      });
  }
  stopTcp() {
    this.userService.stopTcp()
      .subscribe(data => {
        this.req = data;
        console.log('data :', data);
      });
  }
}
