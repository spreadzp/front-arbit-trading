import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbitrageExchangeComponent } from './arbitrage-exchange.component';

describe('ArbitrageExchangeComponent', () => {
  let component: ArbitrageExchangeComponent;
  let fixture: ComponentFixture<ArbitrageExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArbitrageExchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArbitrageExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
