import { GroupExchangeComponent } from './../group-exchange/group-exchange.component';
import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ArbitrageExchange } from '../../../models/arbitrageExchange';
import { ExchangeService } from '../../../../services/exchange.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent {
  @ViewChild(GroupExchangeComponent) groupExchange: GroupExchangeComponent;
  //@ViewChild('formEdit') formEdit: any;
  groupId = '';
  panelOpenState = false;
  nameExchange = '';
  pair = '';
  member = '';
  tradeVolume = 0;
  fee = 0;
  deviation = 0;
  status = '';
  serverName = '';
  [propName: string]: any;

  constructor(private readonly exchangeService: ExchangeService) { }
  setStatus(event: any) {
    const fieldName: string = event.srcElement.id;
    this[fieldName] = event.target.value;
  }

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
    this.groupExchange.getTradeLinesData();
    this.clearFields();
  }

  clearFields(): void {
    this.groupId = '';
    this.nameExchange = '';
    this.pair = '';
    this.member = '';
    this.tradeVolume = 0;
    this.fee = 0;
    this.deviation = 0;
    this.status = '';
    this.serverName = '';
  }
}
