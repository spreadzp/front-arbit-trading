import { ExchangeSpread } from './../../models/exchangeSpread';
import { UserService } from './../../../services/user.service';
import { interval } from 'rxjs';
import { ExchangeService } from './../../../services/exchange.service';
import { ArbitrageExchange } from './../../models/arbitrageExchange';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDatepicker, MatTableDataSource } from '@angular/material';
import { Component, OnInit, ViewChild, ElementRef, Pipe } from '@angular/core';

@Component({
  selector: 'app-percent-exchange',
  templateUrl: './percent-exchange.component.html',
  styleUrls: ['./percent-exchange.component.scss']
})
export class PercentExchangeComponent implements OnInit {
  displayedColumns: string[] = [];
  bidAskSpread: ExchangeSpread[] = [];
  askBidSpread: ExchangeSpread[] = [];
  dataSourceBidAsk: MatTableDataSource<ExchangeSpread>;
  dataSourceAskBid: MatTableDataSource<ExchangeSpread>;
  selection: SelectionModel<ExchangeSpread>;
  source:  any;

  constructor(
    private readonly exchangeService: ExchangeService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.getTradeLinesData();
    this.fetchData();
    this.selection = new SelectionModel<ExchangeSpread>(true, []);
    this.isAllSelected();
    this.source = interval(1000);
    this.updateDate();
  }
  updateDate() {
    const t = this.source.subscribe((x: any) => {
      this.fetchData();
    });
  }

  fetchData() {
    this.userService.getData<{bidAsk: ExchangeSpread[], askBid: ExchangeSpread[]}>('sever-tcp/current-spread')
      .subscribe(data => {
        this.bidAskSpread = data.bidAsk;
        this.askBidSpread = data.askBid;
        this.dataSourceBidAsk = new MatTableDataSource<ExchangeSpread>(this.bidAskSpread);
        this.dataSourceAskBid = new MatTableDataSource<ExchangeSpread>(this.askBidSpread);
      });
    this.exchangeService.getHeaderTableNames('headerSpreadTable')
      .subscribe((header) => {
        this.displayedColumns = header;
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    if (this.dataSourceBidAsk) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSourceBidAsk.data.length;
      return numSelected === numRows;
    }

  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSourceBidAsk.data.forEach(row => this.selection.select(row));
  }
  getTradeLinesData() {
    /*   this.exchangeService.getCurrrentTradeLines()
        .subscribe(data => {
          this.tradeLines = data;
          this.dataSource = new MatTableDataSource<ExchangeData>(this.tradeLines);
        });
      this.exchangeService.getHeaderTable()
        .subscribe((header) => {
          this.displayedColumns = header;
        }); */
  }
}
