import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentExchangeComponent } from './percent-exchange.component';

describe('PercentExchangeComponent', () => {
  let component: PercentExchangeComponent;
  let fixture: ComponentFixture<PercentExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PercentExchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
