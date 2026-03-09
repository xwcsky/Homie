import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Tu upewnij się, że ścieżki do plików się zgadzają
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ExpenseListComponent } from './features/finances/expense-list/expense-list.component';
import { ShoppingListComponent } from './features/shopping/shopping-list/shopping-list.component';
import { ChoresBoardComponent } from './features/chores/chores-board/chores-board.component';
import { OnboardingComponent } from './features/auth/onboarding/onboarding.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'finances', component: ExpenseListComponent },
  { path: 'shopping', component: ShoppingListComponent },
  { path: 'chores', component: ChoresBoardComponent },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }