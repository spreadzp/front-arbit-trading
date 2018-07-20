import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnChanges, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { ArbitrageExchange } from '../../../models/arbitrageExchange';
import { ExchangeService } from '../../../../services/exchange.service';

@Component({
  selector: 'app-group-exchange',
  templateUrl: './group-exchange.component.html',
  styleUrls: ['./group-exchange.component.scss']
})
// implements OnInit
export class GroupExchangeComponent implements OnInit, OnChanges {
  @Output() onChanged = new EventEmitter<boolean>();
  @Input() dataRefresh: boolean;
  displayedColumns: string[] = [];
  tradeLines: ArbitrageExchange[] = [];
  dataSource: MatTableDataSource<ArbitrageExchange>;
  selection: SelectionModel<ArbitrageExchange>;
  constructor(
     private readonly exchangeService: ExchangeService
   ) { }

    ngOnInit() {
      this.getTradeLinesData();
      this.selection = new SelectionModel<ArbitrageExchange>(true, []);
      }

      ngOnChanges() { 
        if (this.dataRefresh) {
          this.getTradeLinesData();
          this.dataRefresh = false;
        }
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
    this.exchangeService.getCurrrentTradeLines()
    .subscribe(data => {
      this.tradeLines = data;
      this.dataSource = new MatTableDataSource<ArbitrageExchange>(this.tradeLines);
    });
    this.exchangeService.getHeaderTable()
    .subscribe((header) => {
      this.displayedColumns = header;
    });
  }
}
