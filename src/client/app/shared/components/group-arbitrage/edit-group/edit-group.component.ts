import { Component, OnInit, ViewChild, ElementRef, NgModule } from '@angular/core';
import { ArbitrageExchange } from '../../../models/arbitrageExchange';
import { ExchangeService } from '../../../../services/exchange.service';
import { CommonModule, NgForOf } from '@angular/common';

@NgModule({
  imports: [CommonModule, NgForOf]
  })
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
  //public tradeLines: ArbitrageExchange[] = [];
   private tradeLines: ArbitrageExchange[] = [
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

  constructor(
    private readonly exchangeService: ExchangeService
  ) { }

  ngOnInit() {
 /*  this.exchangeService.getCurrrentTradeLines()
    .then((tradeLines: ArbitrageExchange[]) => {
      this.tradeLines = tradeLines;
      console.log('this.tradeLines :', this.tradeLines);
    }); */
    this.exchangeName = this.nameExchange.nativeElement as HTMLInputElement;
    this.pairArbitrage = this.pair.nativeElement as HTMLInputElement;
    this.arbitMember = this.member.nativeElement as HTMLInputElement;
    this.volume = this.tradeVolume.nativeElement as HTMLInputElement;
    this.feeExchange = this.fee.nativeElement as HTMLInputElement;
    this.deviationPrice = this.deviation.nativeElement as HTMLInputElement;
    this.groupId = this.idGroup.nativeElement as HTMLInputElement;
    this.statusConnect = this.status.nativeElement as HTMLInputElement;
    this.server = this.serverName.nativeElement as HTMLInputElement;
    console.log("this.arbitMember", this.arbitMember);
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
