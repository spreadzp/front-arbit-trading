import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { ArbitrageExchange } from '../../../models/arbitrageExchange';
import { ExchangeService } from '../../../../services/exchange.service';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent {
  @Output() onChanged = new EventEmitter<boolean>();

  @Output() arbitrageExchangeAdded: EventEmitter<ArbitrageExchange> = new EventEmitter();
  groupId = '';
  panelOpenState = false;
  nameExchange = '';
  pair = '';
  member = '';
  tradeVolume = 0;
  fee = 0;
  deviation = 0;
  newData = false;
  status = '';
  serverName = '';
  constructor(private readonly exchangeService: ExchangeService) { }
  createGroupArbitrage(): void {
    const line: ArbitrageExchange = {
      IdGroupArbitrage: this.groupId,
      exchange: this.nameExchange,
      pair: this.pair,
      memberOfExchange: this.member,
      tradeVolume: this.tradeVolume,
      fee: this.fee,
      deviation: this.deviation,
      serverName: this.serverName,
      status: this.status,
    };
    this.exchangeService.addTradeLine(line);
    this.newData = true;
    this.onChanged.emit(this.newData);
    this.arbitrageExchangeAdded.emit(line);
    this.clearFields();
  }

  clearFields(): void {
    this.groupId = '';
    this.panelOpenState = false;
    this.nameExchange = '';
    this.pair = '';
    this.member = '';
    this.tradeVolume = 0;
    this.fee = 0;
    this.deviation = 0;
    this.newData = false;
    this.status = '';
    this.serverName = '';
  }
}
