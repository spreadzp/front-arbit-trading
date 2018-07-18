import { Component, OnInit } from '@angular/core';
import { ArbitrageService } from '../../services/arbitrage.service';
import { GroupArbitrage } from '../../shared/models/groupArbitrage';

@Component({
  selector: 'app-arbitrage',
  templateUrl: './arbitrage.component.html',
  styleUrls: ['./arbitrage.component.scss']
})
export class ArbitrageComponent implements OnInit {

  groups: GroupArbitrage[];

  constructor(
    private readonly arbitrageService: ArbitrageService
  ) { }

  ngOnInit() {
    this.arbitrageService.getCurrrentGroup()
      .then((groups: GroupArbitrage[]) => {
        this.groups = groups;
      });

    // this.shoppingListService.ingredientsChanged
    //   .subscribe((ingredients: Ingredient[]) => {
    //     this.ingredients = ingredients;
    //   });
  }

}

