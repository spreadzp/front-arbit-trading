import { EventEmitter, Injectable } from '@angular/core';
import { GroupArbitrage } from '../shared/models/groupArbitrage';

@Injectable()
export class ArbitrageService {
  public groupCreated: EventEmitter<GroupArbitrage> = new EventEmitter();
 // public ingredientsChanged: EventEmitter<Ingredient[]> = new EventEmitter();

  private groupsArbitrage: GroupArbitrage[] = [
    new GroupArbitrage('BTC'),
    new GroupArbitrage('ETH'),
    new GroupArbitrage('LTC')
  ];

  constructor() {}

  public getCurrrentGroup(): Promise<GroupArbitrage[]> {
    return new Promise<GroupArbitrage[]>((resolve, reject) => {
      resolve(this.groupsArbitrage);
    });
  }

  public addGroup(group: GroupArbitrage) {
    this.groupsArbitrage.push(group);
   // this.ingredientsChanged.emit(this.ingredients.slice());
  }

  public removeMemberArbitrage(index: number) {
    this.groupsArbitrage.splice(index, 1);
   // this.ingredientsChanged.emit(this.ingredients.slice());
  }

  public addMemberArbitrage(newGroup: GroupArbitrage[]): void {
    this.groupsArbitrage.push(...newGroup);
    // this.ingredientsChanged.emit(this.ingredients.slice());
  }

}
