import { UserService } from './../../../services/user.service';

import { Component, OnInit } from '@angular/core';
import { ExchangeData } from '../../../shared/models/exchangeData';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  name: string;
  price: string;
  items: ExchangeData[];
  req: any[];
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.getData<ExchangeData[]>('sever-tcp/current-price')
      .subscribe(data => {
        this.items = data;
        console.log('this.items :', this.items);
      });
  }

  addItem(name: string, price: string) {
    //this.userService.addData(name, price);
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
