import { Exchange } from './../../shared/models/exchange';
import { PersonValidatorService } from './../../services/person.validator.service';
import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { TableDataSource } from './tableDataSource';
import { ValidatorService } from '../../services/validatorService';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  providers: [
    { provide: ValidatorService, useClass: PersonValidatorService }
  ],
})
export class SettingComponent implements OnInit {
  displayedColumns = ['name', 'age', 'actionsColumn'];

  @Input() personList: Exchange[];
  @Output() personListChange = new EventEmitter<Exchange[]>();

  dataSource: TableDataSource<Exchange>;
  constructor(private personValidator: ValidatorService) { }

  ngOnInit() {
    /* this.dataSource = new TableDataSource<any>(this.personList, Person, this.personValidator);

    this.dataSource.datasourceSubject.subscribe(personList => this.personListChange.emit(personList)); */
  }
}
