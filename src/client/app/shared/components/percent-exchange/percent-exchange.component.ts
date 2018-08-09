import { ExchangeData } from './../../models/exchangeData';
import { UserService } from './../../../services/user.service';
import { interval } from 'rxjs';
import { ExchangeService } from './../../../services/exchange.service';
import { ArbitrageExchange } from './../../models/arbitrageExchange';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDatepicker, MatTableDataSource } from '@angular/material';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-percent-exchange',
  templateUrl: './percent-exchange.component.html',
  styleUrls: ['./percent-exchange.component.scss']
})
export class PercentExchangeComponent implements OnInit {
  displayedColumns: string[] = [];
  tradeLines: ExchangeData[] = [];
  dataSource: MatTableDataSource<ExchangeData>;
  selection: SelectionModel<ExchangeData>;
  source: any;

  constructor(
    private readonly exchangeService: ExchangeService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.getTradeLinesData();
    this.fetchData();
    this.selection = new SelectionModel<ExchangeData>(true, []);
    this.isAllSelected();
    this.source = interval(1000);
    this.updateDate();
  }
  updateDate() {
    const t = this.source.subscribe((x: any) => {
      this.fetchData();
      console.log('x :', x);
    });
  }

  fetchData() {
    this.userService.getData<ExchangeData[]>('sever-tcp/current-price')
      .subscribe(data => {
        this.tradeLines = data;
        this.dataSource = new MatTableDataSource<ExchangeData>(this.tradeLines);
        console.log('data :', data);
      });
      this.exchangeService.getHeaderTableNames('percentTable')
      .subscribe((header) => {
        this.displayedColumns = header;
        console.log('this.displayedColumns :', this.displayedColumns);
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
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
