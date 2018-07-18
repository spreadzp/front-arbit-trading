import { Exchange } from './../../../models/exchange';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ArbitrageExchange } from '../../../models/arbitrageExchange';
import { ExchangeService } from '../../../../services/exchange.service';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent implements OnInit {

  @ViewChild('nameExchange') nameExchange: ElementRef;
  @ViewChild('pair') pair: ElementRef;
  @ViewChild('member') member: ElementRef;
  @ViewChild('tradeVolume') tradeVolume: ElementRef;
  @ViewChild('fee') fee: ElementRef;
  @ViewChild('deviation') deviation: ElementRef;
  @ViewChild('status') status: ElementRef;
  @ViewChild('idGroup') idGroup: ElementRef;
  @ViewChild('serverName') serverName: ElementRef;

  private exchangeName: HTMLInputElement;
  private pairArbitrage: HTMLInputElement;
  private arbitMember: HTMLInputElement;
  private volume: HTMLInputElement;
  private feeExchange: HTMLInputElement;
  private deviationPrice: HTMLInputElement;
  private groupId: HTMLInputElement;
  private statusConnect: HTMLInputElement;
  private server: HTMLInputElement;
  public tradeLines: ArbitrageExchange[];

  constructor(
    private readonly exchangeService: ExchangeService
  ) { }

  ngOnInit() {
    this.exchangeName = this.nameExchange.nativeElement as HTMLInputElement;
    this.pairArbitrage = this.pair.nativeElement as HTMLInputElement;
    this.arbitMember = this.member.nativeElement as HTMLInputElement;
    this.volume = this.tradeVolume.nativeElement as HTMLInputElement;
    this.feeExchange = this.fee.nativeElement as HTMLInputElement;
    this.deviationPrice = this.deviation.nativeElement as HTMLInputElement;
    this.groupId = this.idGroup.nativeElement as HTMLInputElement;
    this.statusConnect = this.status.nativeElement as HTMLInputElement;
    this.server = this.serverName.nativeElement as HTMLInputElement;
    this.exchangeService.getCurrrentTradeLines()
    .then((tradeLines: ArbitrageExchange[]) => {
      this.tradeLines = tradeLines;
    });
  }

  createGroupArbitrage(): void {
    const line: ArbitrageExchange = {
      IdGroupArbitrage: this.groupId.value,
      exchange: this.exchangeName.value,
      pair: this.pairArbitrage.value,
      memberOfExchange: this.arbitMember.value,
      tradeVolume: +this.volume.value,
      fee: +this.feeExchange.value,
      deviation: +this.deviationPrice.value,
      serverName: this.server.value,
      status: this.statusConnect.value,
    };
    this.exchangeService.addTradeLine(line);
    this.clearFields();
  }

  clearFields(): void {
    this.exchangeName.value = null;
    this.pairArbitrage.value = null;
    this.arbitMember = null;
  }
}
