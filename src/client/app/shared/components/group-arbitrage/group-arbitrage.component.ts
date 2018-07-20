import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GroupArbitrage } from '../../models/groupArbitrage';

@Component({
  selector: 'app-group-arbitrage',
  templateUrl: './group-arbitrage.component.html',
  styleUrls: ['./group-arbitrage.component.scss']
})
export class GroupArbitrageComponent implements OnInit {

  @Input() group: GroupArbitrage;
  @Output() groupRemoved: EventEmitter<GroupArbitrage> = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  onRemoveGroup() {
    this.groupRemoved.emit(this.group);
  }
}
