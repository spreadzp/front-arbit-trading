import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Ingredient } from '../ingredient/ingredient.component';
import { Rate } from '../../models/rate';
@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent implements OnInit {

  @Input() rate: Rate;
  @Output() rateRemoved: EventEmitter<Rate> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onRemoveRate() {
    this.rateRemoved.emit(this.rate);
  }

}
