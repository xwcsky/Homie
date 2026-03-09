import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ExpenseListComponent } from './features/finances/expense-list/expense-list.component';
import { ShoppingListComponent } from './features/shopping/shopping-list/shopping-list.component';
import { ChoresBoardComponent } from './features/chores/chores-board/chores-board.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AuthInterceptor } from './auth/auth.interceptor';
import { OnboardingComponent } from './features/auth/onboarding/onboarding.component';

@NgModule({
  declarations: [
    AppComponent,
    ShoppingListComponent,
    NavbarComponent,
  ],
  imports: [
    RegisterComponent,
    BrowserModule,
    AppRoutingModule,
    LoginComponent,
    DashboardComponent,
    ExpenseListComponent,
    ChoresBoardComponent,
    OnboardingComponent,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true 
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
