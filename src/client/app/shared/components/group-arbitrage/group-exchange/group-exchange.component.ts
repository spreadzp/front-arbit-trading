import {SelectionModel} from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import { ArbitrageExchange } from '../../../models/arbitrageExchange';
import { ExchangeService } from '../../../../services/exchange.service';

/* export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
} */

/* const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
]; */

const tradeLines: ArbitrageExchange[] = [
  {
      IdGroupArbitrage: 'BTC',
      exchange: 'bitfinex',
      pair: 'BTC/USD',
      memberOfExchange: 'Vasya',
      tradeVolume: 0.01,
      fee: 0.2,
      deviation: 0.05,
      serverName: 'Seul',
      status: 'Connect',
  },
  {
      IdGroupArbitrage: 'BTC',
      exchange: 'bittrex',
      pair: 'BTC/USDT',
      memberOfExchange: 'Kolya',
      tradeVolume: 0.01,
      fee: 0.1,
      deviation: 0.04,
      serverName: 'EU',
      status: 'Connect',
  }
];
@Component({
  selector: 'app-group-exchange',
  templateUrl: './group-exchange.component.html',
  styleUrls: ['./group-exchange.component.scss']
})
export class GroupExchangeComponent implements OnInit {
 
  displayedColumns: string[] = [
    'select', 'pair', 'exchange', 'member', 'Trade Volume', 'Fee', 'Deviation', 'Server Name', 'Status connection'];
    dataSource = new MatTableDataSource<ArbitrageExchange>(tradeLines);
    selection = new SelectionModel<ArbitrageExchange>(true, []);
  constructor(
    private readonly exchangeService: ExchangeService
  ) { }

  ngOnInit() {
    /* this.displayedColumns = [
      'select', 'pair', 'exchange', 'member', 'Trade Volume', 'Fee', 'Deviation', 'Server Name', 'Status connection']; */
 
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
}
