import { PersonValidatorService } from './person.validator.service';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RecipesService } from './recipes.service';
import { ShoppingListService } from './shopping-list.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { ApiService } from './api.service';
import { ArbitrageService } from './arbitrage.service';
import { ExchangeService } from './exchange.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [AuthService, RecipesService, ShoppingListService,
  UserService, ApiService, PersonValidatorService, ArbitrageService, ExchangeService]
})
export class ServicesModule {}
