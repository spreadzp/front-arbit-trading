import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';

interface ISection {
  title: string;
  link: string;
}

interface INav {
  root: ISection;
  sections: ISection[];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  nav: INav = {
    root: {title: 'General server', link: 'recipes'},
    sections: [
      {title: 'Settings', link: 'recipes'},
      {title: 'Markets', link: 'user'},
      {title: 'Trades', link: 'trades'},
      {title: 'Export', link: 'export'},
      {title: 'Order', link: 'order'},
      {title: 'Setting', link: 'setting'},
      {title: 'Arbitrage', link: 'arbitrage'},
      {title: 'Percent', link: 'percent'}
    ]
  };

  constructor() { }

  ngOnInit() {
  }
}
