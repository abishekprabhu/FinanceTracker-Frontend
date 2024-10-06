import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from '../component/user/user.component';
import { CategoryComponent } from '../component/category/category.component';
import { CategoryUpdateComponent } from '../component/category-update/category-update.component';
import { IncomeComponent } from '../component/income/income.component';
import { IncomeUpdateComponent } from '../component/income-update/income-update.component';
import { ExpenseComponent } from '../component/expense/expense.component';
import { ExpenseUpdateComponent } from '../component/expense-update/expense-update.component';
import { TransactionComponent } from '../component/transaction/transaction.component';
import { TransactionUpdateComponent } from '../component/transaction-update/transaction-update.component';
import { LoginComponent } from '../../../auth/components/login/login.component';
import { SettingsComponent } from '../component/settings/settings.component';
import { BudgetComponent } from '../component/budget/budget.component';
import { BudgetUpdateComponent } from '../component/budget-update/budget-update.component';
import { StatsComponent } from '../component/stats/stats.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: UserComponent,
  },
  {
    path: 'category',
    component: CategoryComponent,
  },
  {
    path: 'category/:categoryId/edit',
    component: CategoryUpdateComponent,
  },
  {
    path: 'income',
    component: IncomeComponent,
  },
  {
    path: 'income/:id/edit',
    component: IncomeUpdateComponent,
  },
  {
    path: 'expense',
    component: ExpenseComponent,
  },
  {
    path: 'expense/:id/edit',
    component: ExpenseUpdateComponent,
  },
  {
    path: 'transaction',
    component: TransactionComponent,
  },
  {
    path: 'transaction/:id/edit',
    component: TransactionUpdateComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'budget',
    component: BudgetComponent,
  },
  {
    path: 'budget/:id/edit',
    component: BudgetUpdateComponent,
  },
  {
    path: 'stats',
    component: StatsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
