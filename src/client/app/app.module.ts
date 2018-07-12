import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_ID, Inject, PLATFORM_ID, NgModule } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// components
import { AppComponent } from './components/app.component';
import { HeaderComponent } from './components/header/header.component';
import { RecipesComponent } from './components/recipes/recipes.component';
import { RecipesListComponent } from './components/recipes/recipes-list/recipes-list.component';
import { RecipeEditComponent } from './components/recipes/recipe-edit/recipe-edit.component';
import { RecipeDetailsComponent } from './components/recipes/recipe-details/recipe-details.component';
import { RecipeItemComponent } from './components/recipes/recipes-list/recipe-item/recipe-item.component';
import { ShoppingListComponent } from './components/shopping-list/shopping-list.component';
import { ShoppingListEditComponent } from './components/shopping-list/shopping-list-edit/shopping-list-edit.component';
import { UserComponent } from './components/user/user/user.component';
import { TradesComponent } from './components/trades/trades.component';
import { ExportComponent } from './components/export/export.component';

// modules
import { AppRoutingModule } from './app.routing.module';
// import { GraphqlModule } from './app.graphql.module';
import { GuardsModule } from './guards/guards.module';
import { InterceptorsModule } from './interceptors/interceptors.module';
import { MaterialModule } from './material/material.module';
import { ServicesModule } from './services/services.module';
import { SharedModule } from './shared/shared.module';
import { HttpModule } from '@angular/http';
import {HttpClientModule} from '@angular/common/http';
import { NgDatepickerModule } from 'ng2-datepicker';
import { OrderComponent } from './components/order/order.component';
import { SettingComponent } from './components/setting/setting.component';
import { MatFormFieldModule } from '@angular/material';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    HeaderComponent,
    RecipesComponent,
    RecipesListComponent,
    RecipeDetailsComponent,
    RecipeEditComponent,
    RecipeItemComponent,
    ShoppingListComponent,
    ShoppingListEditComponent,
    UserComponent,
    TradesComponent,
    ExportComponent,
    OrderComponent,
    SettingComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule.withServerTransition({ appId: 'nest-angular' }),
    BrowserTransferStateModule,
    BrowserAnimationsModule,
    MaterialModule,
    ServicesModule,
    SharedModule,
    GuardsModule,
    // GraphqlModule,
    InterceptorsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    NgDatepickerModule,
    MatFormFieldModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(APP_ID) private appId: string
  ) {
    const platform = isPlatformBrowser(platformId) ?
      'in the browser' : 'on the server';

    console.log(`Running ${platform} with appId=${appId}`);
  }
}
