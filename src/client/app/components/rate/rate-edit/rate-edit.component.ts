import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Rate } from '../../../shared/models/rate';
import { RateService } from '../../../services/rate.service';

@Component({
  selector: 'app-rate-edit',
  templateUrl: './rate-edit.component.html',
  styleUrls: ['./rate-edit.component.scss']
})
export class RateEditComponent implements OnInit {

  @ViewChild('exchangeName') exchangeName: ElementRef;
  @ViewChild('takerFee') takerFee: ElementRef;
  @ViewChild('makerFee') makerFee: ElementRef;

  private exchangeNameInput: HTMLInputElement;
  private takerFeeInput: HTMLInputElement;
  private makerFeeInput: HTMLInputElement;

  constructor(
    private readonly rateService: RateService
  ) { }

  ngOnInit() {
    this.exchangeNameInput = this.exchangeName.nativeElement as HTMLInputElement;
    this.takerFeeInput = this.takerFee.nativeElement as HTMLInputElement;
    this.makerFeeInput = this.makerFee.nativeElement as HTMLInputElement;
  }

  createRate(): void {
    const rate: Rate = new Rate(
      this.exchangeNameInput.value,
      +this.takerFeeInput.value,
      +this.makerFeeInput.value
    );

    this.rateService.addRate(rate);
    this.clearFields();
  }

  clearFields(): void {
    this.exchangeNameInput.value = null;
    this.takerFeeInput.value = null;
    this.makerFeeInput.value = null;
  }

}
