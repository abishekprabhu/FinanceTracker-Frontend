import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './auth/components/signup/signup.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoNgZorroAntdModule } from './DemoNgZorroAntdModule';
import { SiderComponent } from './sider/sider/sider.component';
import { HomeComponent } from './sider/home/home.component';
import { LoginComponent } from './auth/components/login/login.component';
import { UserComponent } from './modules/User/component/user/user.component';
import { CategoryComponent } from './modules/User/component/category/category.component';
import { CategoryUpdateComponent } from './modules/User/component/category-update/category-update.component';
import { IncomeComponent } from './modules/User/component/income/income.component';
import { IncomeUpdateComponent } from './modules/User/component/income-update/income-update.component';
import { ExpenseUpdateComponent } from './modules/User/component/expense-update/expense-update.component';
import { ExpenseComponent } from './modules/User/component/expense/expense.component';
import { TransactionComponent } from './modules/User/component/transaction/transaction.component';
import { TransactionUpdateComponent } from './modules/User/component/transaction-update/transaction-update.component';
import { UnauthorizedComponent } from './auth/components/unauthorized/unauthorized.component';
import { SettingsComponent } from './modules/User/component/settings/settings.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    SiderComponent,
    HomeComponent,
    LoginComponent,
    UserComponent,
    CategoryComponent,
    CategoryUpdateComponent,
    IncomeComponent,
    IncomeUpdateComponent,
    ExpenseComponent,
    ExpenseUpdateComponent,
    TransactionComponent,
    TransactionUpdateComponent,
    UnauthorizedComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DemoNgZorroAntdModule,
    ReactiveFormsModule
  ],
  providers: [
    provideClientHydration(),
    { provide: NZ_I18N, useValue: en_US },
    provideAnimationsAsync(),
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
