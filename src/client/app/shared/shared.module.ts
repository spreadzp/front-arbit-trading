import { NgModule } from '@angular/core';
import { DropdownDirective } from './directives/dropdown.directive';
import { IngredientComponent } from './components/ingredient/ingredient.component';
import { ExchangeComponent } from './components/exchange/exchange.component';
import { PairComponent } from './components/pair/pair.component';
import { MemberComponent } from './components/member/member.component';
import { ArbitrageExchangeComponent } from './components/arbitrage-exchange/arbitrage-exchange.component';
import { GroupArbitrageComponent } from './components/group-arbitrage/group-arbitrage.component';
import { EditGroupComponent } from './components/group-arbitrage/edit-group/edit-group.component';
@NgModule({
  declarations: [DropdownDirective, IngredientComponent, ExchangeComponent,
    PairComponent, MemberComponent, ArbitrageExchangeComponent, GroupArbitrageComponent, EditGroupComponent],
  exports: [DropdownDirective, IngredientComponent, ExchangeComponent,
    PairComponent, MemberComponent, ArbitrageExchangeComponent,
    GroupArbitrageComponent]
})
export class SharedModule { }
