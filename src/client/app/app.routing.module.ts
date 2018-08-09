import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RecipesComponent } from './components/recipes/recipes.component';
import { AppComponent } from './components/app.component';
import { RecipeDetailsComponent } from './components/recipes/recipe-details/recipe-details.component';
import { CanDeactivateGuardService } from './guards/can-deactivate-guard.service';
import { ShoppingListComponent } from './components/shopping-list/shopping-list.component';
import { RecipeEditComponent } from './components/recipes/recipe-edit/recipe-edit.component';
import { UserComponent } from './components/user/user/user.component';
import { TradesComponent } from './components/trades/trades.component';
import { ExportComponent } from './components/export/export.component';
import { OrderComponent } from './components/order/order.component';
import { SettingComponent } from './components/setting/setting.component';
import { ArbitrageComponent } from './components/arbitrage/arbitrage.component';
import { PercentExchangeComponent } from './shared/components/percent-exchange/percent-exchange.component';

const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'recipes'
  },
  {
    path: 'recipes',
    component: RecipesComponent,
    children: [
      {
        path: 'new',
        component: RecipeEditComponent
      },
      {
        path: ':id',
        component: RecipeDetailsComponent,
      },
      {
        path: ':id/edit',
        component: RecipeEditComponent
      }
    ]
  },
  {
    path: 'shopping-list',
    component: ShoppingListComponent,
    // children: [
    //   {
    //     path: ''
    //   }
    // ]
  },
  {
    path: 'user',
    component: UserComponent,
  },
  {
    path: 'trades',
    component: TradesComponent,
  },
  {
    path: 'export',
    component: ExportComponent,
  },
  {
    path: 'order',
    component: OrderComponent,
  },
  {
    path: 'setting',
    component: SettingComponent,
  },
  {
    path: 'arbitrage',
    component: ArbitrageComponent,
  },
  {
    path: 'percent',
    component: PercentExchangeComponent,
  },
  {
    path: '**',
    redirectTo: 'recipes'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      useHash: false,
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
