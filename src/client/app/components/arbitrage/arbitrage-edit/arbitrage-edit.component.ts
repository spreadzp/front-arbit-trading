import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GroupArbitrage } from '../../../shared/models/groupArbitrage';
import { ArbitrageService } from '../../../services/arbitrage.service';
@Component({
  selector: 'app-arbitrage-edit',
  templateUrl: './arbitrage-edit.component.html',
  styleUrls: ['./arbitrage-edit.component.scss']
})
export class ArbitrageEditComponent implements OnInit {
  @ViewChild('idGroup') idGroup: ElementRef;

  private idGroupInput: HTMLInputElement;

  constructor(
    private readonly arbitrageService: ArbitrageService
  ) { }

  ngOnInit() {
    this.idGroupInput = this.idGroup.nativeElement as HTMLInputElement;
  }

  createGroupArbitrage(): void {
    const group: GroupArbitrage = new GroupArbitrage(
      this.idGroupInput.value,
    );

    this.arbitrageService.addGroup(group);
    this.clearFields();
  }

  clearFields(): void {
    this.idGroupInput.value = null;
  }
}
