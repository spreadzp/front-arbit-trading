import { NgModule } from '@angular/core';
import { RecipesService } from './recipes.service';
import { ShoppingListService } from './shopping-list.service';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from './user.service';
import { ApiService } from './api.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [AuthService, RecipesService, ShoppingListService,
  UserService, ApiService]
})
export class ServicesModule {}
